"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, firestore as db } from "@/firebaseConfig"

export interface UserProfile {
  uid: string
  email: string
  fullName: string
  phoneNumber: string
  dateOfBirth?: string
  gender?: string
  address?: string
  isOperator: boolean
  isUser: boolean
  createdAt?: any
  updatedAt?: any
}

interface UserAuthContextType {
  user: User | null
  userProfile: UserProfile | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  signup: (email: string, password: string, profileData: {
    fullName: string
    phoneNumber: string
    dateOfBirth?: string
    gender?: string
    address?: string
  }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshToken: () => Promise<void>
}

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined)

export const useUserAuth = () => {
  const context = useContext(UserAuthContext)
  if (context === undefined) {
    throw new Error("useUserAuth must be used within a UserAuthProvider")
  }
  return context
}

interface UserAuthProviderProps {
  children: ReactNode
}

export const UserAuthProvider = ({ children }: UserAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user profile from Firestore
  const loadUserProfile = async (user: User) => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile
        
        // Only proceed if this is a user account
        if (userData.isUser === true && userData.isOperator === false) {
          setUserProfile({ ...userData, uid: user.uid })
        } else if (userData.isOperator === true) {
          // This is an operator account, don't sign them out here
          // Just don't set the user profile
          setUserProfile(null)
        } else {
          // Invalid account state
          setUserProfile(null)
        }
      } else {
        // No profile found
        setUserProfile(null)
      }
    } catch (error) {
      console.error("Error loading user profile:", error)
      setUserProfile(null)
    }
  }

  // Get and set Firebase ID token
  const setUserToken = async (user: User) => {
    try {
      const idToken = await user.getIdToken()
      setToken(idToken)
    } catch (error) {
      console.error("Error setting token:", error)
    }
  }

  // Monitor auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user)
          await setUserToken(user)
          await loadUserProfile(user)
        } else {
          setUser(null)
          setUserProfile(null)
          setToken(null)
        }
      } catch (error) {
        console.error("Auth state change error:", error)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Login function
// in contexts/user-auth-context.tsx
// Login function
  const login = async (email: string, password: string) => {
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    const user = userCred.user;

    // Fetch profile
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      await signOut(auth);
      throw new Error("No user profile found.");
    }
    const data = userDoc.data() as UserProfile;

    // Must be a passenger
    if (!data.isUser || data.isOperator) {
      await signOut(auth);
      throw new Error("This account is registered as an operator. Please use the Operator Portal.");
    }

    // Good! Now set token + profile
    await setUserToken(user);
    await loadUserProfile(user);
  };


  // Google login function
  // in contexts/user-auth-context.tsx
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCred = await signInWithPopup(auth, provider);
    const user = userCred.user;
    
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data() as UserProfile;
      if (!data.isUser || data.isOperator) {
        await signOut(auth);
        throw new Error("This account is registered as an operator. Please use the Operator Portal.");
      }
      // Valid user: load profile
      await loadUserProfile(user);
    } else {
      // New Google user → create
      const newUser: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: user.displayName || "",
        phoneNumber: user.phoneNumber || "",
        isOperator: false,
        isUser: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", user.uid), newUser);
      setUserProfile(newUser);
    }

    await setUserToken(user);
  };

  // Signup function
  const signup = async (email: string, password: string, profileData: {
    fullName: string
    phoneNumber: string
    dateOfBirth?: string
    gender?: string
    address?: string
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create user profile in Firestore
      const newUserProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        dateOfBirth: profileData.dateOfBirth,
        gender: profileData.gender,
        address: profileData.address,
        isOperator: false,
        isUser: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, "users", user.uid), newUserProfile)
      
      await setUserToken(user)
      setUserProfile(newUserProfile)
    } catch (error: any) {
      throw new Error(error.message || "Signup failed")
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
      
      setUser(null)
      setUserProfile(null)
      setToken(null)
    } catch (error: any) {
      throw new Error(error.message || "Logout failed")
    }
  }

  // Update profile function
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user || !userProfile) {
      throw new Error("No authenticated user")
    }

    try {
      const updatedData = {
        ...profileData,
        updatedAt: serverTimestamp(),
        // Ensure role flags remain correct
        isOperator: false,
        isUser: true
      }

      await updateDoc(doc(db, "users", user.uid), updatedData)
      
      // Update local state
      setUserProfile(prev => prev ? { ...prev, ...updatedData } : null)
    } catch (error: any) {
      throw new Error(error.message || "Profile update failed")
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(error.message || "Password reset failed")
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    if (!user) return

    try {
      const idToken = await user.getIdToken(true) // Force refresh
      setToken(idToken)
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
  }

  const value: UserAuthContextType = {
    user,
    userProfile,
    token,
    loading,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    resetPassword,
    refreshToken
  }

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  )
}