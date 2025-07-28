"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, firestore as db } from "@/firebaseConfig"
import { useRouter } from "next/navigation"

export interface OperatorProfile {
  uid: string
  email: string
  fullName: string
  phoneNumber: string
  companyName?: string
  licenseNumber?: string
  address?: string
  description?: string
  contactNumber?: string
  isOperator: boolean
  isUser: boolean
  createdAt?: any
  updatedAt?: any
}

interface OperatorAuthContextType {
  user: User | null
  operator: OperatorProfile | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, profileData: {
    companyName: string
    contactNumber?: string
    address?: string
    description?: string
    fullName?: string
    phoneNumber?: string
  }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profileData: Partial<OperatorProfile>) => Promise<void>
  refreshToken: () => Promise<void>
}

const OperatorAuthContext = createContext<OperatorAuthContextType | undefined>(undefined)

export const useOperatorAuth = () => {
  const context = useContext(OperatorAuthContext)
  if (context === undefined) {
    throw new Error("useOperatorAuth must be used within an OperatorAuthProvider")
  }
  return context
}

interface OperatorAuthProviderProps {
  children: ReactNode
}

export const OperatorAuthProvider = ({ children }: OperatorAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [operator, setOperator] = useState<OperatorProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load operator profile from Firestore
  const loadOperatorProfile = async (user: User) => {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid))
    if (userDoc.exists()) {
      const userData = userDoc.data() as OperatorProfile
      if (userData.isOperator === true && userData.isUser === false) {
        setOperator({ ...userData, uid: user.uid })
      } else {
        setOperator(null)
      }
    } else {
      setOperator(null)
    }
  } catch (error) {
    setOperator(null)
  }
}

  // Get and set Firebase ID token
  const setUserToken = async (user: User) => {
    try {
      const idToken = await user.getIdToken()
      setToken(idToken)
      
      // Store token in httpOnly cookie via API route (if exists)
      try {
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: idToken })
        })
      } catch (apiError) {
        // API route might not exist, continue without it
        console.log("Token API not available")
      }
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
          await loadOperatorProfile(user)
        } else {
          setUser(null)
          setOperator(null)
          setToken(null)
          
          // Clear token cookie (if API exists)
          try {
            await fetch('/api/auth/clear-token', { method: 'POST' })
          } catch (apiError) {
            // API route might not exist, continue without it
          }
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
  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
      // Check if this is an operator account
      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const userData = userDoc.data()
        if (!userData.isOperator || userData.isUser) {
          await signOut(auth)
          throw new Error("This account is not registered as an operator. Please use the passenger login.")
        }
      } else {
        await signOut(auth)
        throw new Error("Account profile not found.")
      }
      
      await setUserToken(user)
      await loadOperatorProfile(user)
      
      router.push('/operator/counter')
    } catch (error: any) {
      throw new Error(error.message || "Login failed")
    }
  }

  // Register function (for operators)
  const register = async (email: string, password: string, profileData: {
    companyName: string
    contactNumber?: string
    address?: string
    description?: string
    fullName?: string
    phoneNumber?: string
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create operator profile in Firestore
      const operatorProfile: OperatorProfile = {
        uid: user.uid,
        email: user.email!,
        fullName: profileData.fullName || profileData.companyName,
        phoneNumber: profileData.phoneNumber || profileData.contactNumber || '',
        companyName: profileData.companyName,
        licenseNumber: '',
        address: profileData.address || '',
        description: profileData.description || '',
        contactNumber: profileData.contactNumber || '',
        isOperator: true,
        isUser: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, "users", user.uid), operatorProfile)
      
      await setUserToken(user)
      setOperator(operatorProfile)
      
      router.push('/operator/counter')
    } catch (error: any) {
      throw new Error(error.message || "Registration failed")
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await signOut(auth)
      
      // Clear token cookie (if API exists)
      try {
        await fetch('/api/auth/clear-token', { method: 'POST' })
      } catch (apiError) {
        // API route might not exist, continue without it
      }
      
      setUser(null)
      setOperator(null)
      setToken(null)
      
      router.push('/operator/login')
    } catch (error: any) {
      throw new Error(error.message || "Logout failed")
    }
  }

  // Update profile function
  const updateProfile = async (profileData: Partial<OperatorProfile>) => {
    if (!user || !operator) {
      throw new Error("No authenticated user")
    }

    try {
      const updatedData = {
        ...profileData,
        updatedAt: serverTimestamp(),
        // Ensure role flags remain correct
        isOperator: true,
        isUser: false
      }

      await updateDoc(doc(db, "users", user.uid), updatedData)
      
      // Update local state
      setOperator(prev => prev ? { ...prev, ...updatedData } : null)
    } catch (error: any) {
      throw new Error(error.message || "Profile update failed")
    }
  }

  // Refresh token function
  const refreshToken = async () => {
    if (!user) return

    try {
      const idToken = await user.getIdToken(true) // Force refresh
      setToken(idToken)
      
      // Update cookie (if API exists)
      try {
        await fetch('/api/auth/set-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: idToken })
        })
      } catch (apiError) {
        // API route might not exist, continue without it
      }
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
  }

  const value: OperatorAuthContextType = {
    user,
    operator,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshToken
  }

  return (
    <OperatorAuthContext.Provider value={value}>
      {children}
    </OperatorAuthContext.Provider>
  )
}