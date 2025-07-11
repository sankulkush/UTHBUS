"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, firestore as db } from "@/firebaseConfig"
import { useRouter } from "next/navigation"

interface OperatorProfile {
  uid: string
  email: string
  name: string
  phoneNumber: string
  companyName?: string
  licenseNumber?: string
  address?: string
  description?: string
  contactNumber?: string
  createdAt?: any
  updatedAt?: any
}

interface AuthContextType {
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
    name?: string
    phoneNumber?: string
  }) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (profileData: Partial<OperatorProfile>) => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [operator, setOperator] = useState<OperatorProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load operator profile from Firestore
  const loadOperatorProfile = async (user: User) => {
    try {
      const operatorDoc = await getDoc(doc(db, "operators", user.uid))
      if (operatorDoc.exists()) {
        const operatorData = operatorDoc.data() as OperatorProfile
        setOperator({ ...operatorData, uid: user.uid })
      } else {
        // Create basic profile if it doesn't exist
        const basicProfile: OperatorProfile = {
          uid: user.uid,
          email: user.email!,
          name: user.displayName || "",
          phoneNumber: "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
        await setDoc(doc(db, "operators", user.uid), basicProfile)
        setOperator(basicProfile)
      }
    } catch (error) {
      console.error("Error loading operator profile:", error)
    }
  }

  // Get and set Firebase ID token
  const setUserToken = async (user: User) => {
    try {
      const idToken = await user.getIdToken()
      setToken(idToken)
      
      // Store token in httpOnly cookie via API route
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      })
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
          
          // Clear token cookie
          await fetch('/api/auth/clear-token', { method: 'POST' })
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
      
      await setUserToken(user)
      await loadOperatorProfile(user)
      
      router.push('/operator/counter')
    } catch (error: any) {
      throw new Error(error.message || "Login failed")
    }
  }

  // Register function
  const register = async (email: string, password: string, profileData: {
    companyName: string
    contactNumber?: string
    address?: string
    description?: string
    name?: string
    phoneNumber?: string
  }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Create operator profile in Firestore
      const operatorProfile: OperatorProfile = {
        uid: user.uid,
        email: user.email!,
        name: profileData.name || profileData.companyName,
        phoneNumber: profileData.phoneNumber || profileData.contactNumber || '',
        companyName: profileData.companyName,
        licenseNumber: '',
        address: profileData.address || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      await setDoc(doc(db, "operators", user.uid), operatorProfile)
      
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
      
      // Clear token cookie
      await fetch('/api/auth/clear-token', { method: 'POST' })
      
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
        updatedAt: serverTimestamp()
      }

      await updateDoc(doc(db, "operators", user.uid), updatedData)
      
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
      
      // Update cookie
      await fetch('/api/auth/set-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: idToken })
      })
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
  }

  const value: AuthContextType = {
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
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}