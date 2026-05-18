"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, firestore as db } from "@/firebaseConfig"
import { useRouter } from "next/navigation"

export interface OperatorProfile {
  uid: string
  email: string
  name: string
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
    name?: string
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

  // Load operator profile from the operators collection.
  // Only succeeds if the document exists AND has isOperator: true, isUser: false.
  const loadOperatorProfile = async (firebaseUser: User) => {
    try {
      const snap = await getDoc(doc(db, "operators", firebaseUser.uid))
      if (snap.exists()) {
        const data = snap.data() as OperatorProfile
        if (data.isOperator === true && data.isUser === false) {
          setOperator({ ...data, uid: firebaseUser.uid })
          return
        }
      }
      setOperator(null)
    } catch {
      setOperator(null)
    }
  }

  const setUserToken = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken()
      setToken(idToken)
      try {
        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        })
      } catch { /* API route optional */ }
    } catch (error) {
      console.error("Error setting token:", error)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser)
          await setUserToken(firebaseUser)
          await loadOperatorProfile(firebaseUser)
        } else {
          setUser(null)
          setOperator(null)
          setToken(null)
          try { await fetch("/api/auth/clear-token", { method: "POST" }) } catch { /* optional */ }
        }
      } catch (error) {
        console.error("Auth state change error:", error)
      } finally {
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Login: authenticate, then verify the account is a real operator.
  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const snap = await getDoc(doc(db, "operators", firebaseUser.uid))
    if (!snap.exists()) {
      await signOut(auth)
      throw new Error("No operator account found for this email. Please register as an operator first.")
    }
    const data = snap.data() as OperatorProfile
    if (data.isOperator !== true || data.isUser !== false) {
      await signOut(auth)
      throw new Error("This account is not authorised as an operator.")
    }

    await setUserToken(firebaseUser)
    setOperator({ ...data, uid: firebaseUser.uid })
    router.push("/operator/counter")
  }

  // Register: create Firebase Auth user + operators collection document with role flags.
  const register = async (
    email: string,
    password: string,
    profileData: {
      companyName: string
      contactNumber?: string
      address?: string
      description?: string
      name?: string
      phoneNumber?: string
    }
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const operatorProfile: OperatorProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name: profileData.name || profileData.companyName,
      phoneNumber: profileData.phoneNumber || profileData.contactNumber || "",
      companyName: profileData.companyName,
      licenseNumber: "",
      address: profileData.address || "",
      description: profileData.description || "",
      contactNumber: profileData.contactNumber || "",
      isOperator: true,
      isUser: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Write to operators collection — this is the single source of truth for operator accounts.
    await setDoc(doc(db, "operators", firebaseUser.uid), operatorProfile)

    await setUserToken(firebaseUser)
    setOperator(operatorProfile)
    router.push("/operator/counter")
  }

  const logout = async () => {
    await signOut(auth)
    try { await fetch("/api/auth/clear-token", { method: "POST" }) } catch { /* optional */ }
    setUser(null)
    setOperator(null)
    setToken(null)
    router.push("/")
  }

  const updateProfile = async (profileData: Partial<OperatorProfile>) => {
    if (!user || !operator) throw new Error("No authenticated operator")
    const updatedData = {
      ...profileData,
      updatedAt: serverTimestamp(),
      // Role flags are immutable — never let a profile update change them.
      isOperator: true,
      isUser: false,
    }
    await updateDoc(doc(db, "operators", user.uid), updatedData)
    setOperator((prev) => (prev ? { ...prev, ...updatedData } : null))
  }

  const refreshToken = async () => {
    if (!user) return
    try {
      const idToken = await user.getIdToken(true)
      setToken(idToken)
      try {
        await fetch("/api/auth/set-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        })
      } catch { /* optional */ }
    } catch (error) {
      console.error("Error refreshing token:", error)
    }
  }

  return (
    <OperatorAuthContext.Provider value={{
      user, operator, token, loading,
      login, register, logout, updateProfile, refreshToken,
    }}>
      {children}
    </OperatorAuthContext.Provider>
  )
}
