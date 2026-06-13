"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, firestore as db } from "@/firebaseConfig"
import { useRouter } from "next/navigation"

/** Operator-level KYC review state. Set at registration, flipped by admin. */
export type KycStatus = "pending_verification" | "approved" | "rejected"

/** Operator account status, orthogonal to KYC. Admin can suspend a bad actor
 *  even after they've been KYC-approved. Suspended operators can't log in and
 *  their buses are hidden from user search. */
export type AccountStatus = "active" | "suspended"

export interface OperatorProfile {
  uid: string
  email: string
  name: string
  phoneNumber: string
  companyName?: string
  licenseNumber?: string
  panNumber?: string
  address?: string
  description?: string
  contactNumber?: string
  isOperator: boolean
  isUser: boolean
  // KYC gate (Sprint 2). New operators start pending_verification; their buses
  // cannot surface in user search until an admin sets this to "approved".
  kycStatus?: KycStatus
  kycRejectionReason?: string
  kycReviewedAt?: any
  kycReviewedBy?: string // admin email
  // Account status (admin suspend/reactivate). Absent = active (legacy operators).
  accountStatus?: AccountStatus
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
    licenseNumber?: string
    panNumber?: string
  }) => Promise<string>
  logout: () => Promise<void>
  updateProfile: (profileData: Partial<OperatorProfile>) => Promise<void>
  refreshToken: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
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
    if (data.accountStatus === "suspended") {
      await signOut(auth)
      throw new Error("This operator account has been suspended. Please contact UthBus support.")
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
      licenseNumber?: string
      panNumber?: string
    }
  ): Promise<string> => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const firebaseUser = userCredential.user

    const operatorProfile: OperatorProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      name: profileData.name || profileData.companyName,
      phoneNumber: profileData.phoneNumber || profileData.contactNumber || "",
      companyName: profileData.companyName,
      licenseNumber: profileData.licenseNumber || "",
      panNumber: profileData.panNumber || "",
      address: profileData.address || "",
      description: profileData.description || "",
      contactNumber: profileData.contactNumber || "",
      isOperator: true,
      isUser: false,
      // KYC gate — every new operator starts unverified (Sprint 2).
      kycStatus: "pending_verification",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Write to operators collection — this is the single source of truth for operator accounts.
    await setDoc(doc(db, "operators", firebaseUser.uid), operatorProfile)

    await setUserToken(firebaseUser)
    setOperator(operatorProfile)
    // NOTE: no redirect here. The register page uploads KYC documents under the
    // returned uid before navigating, so it owns the post-registration redirect.
    return firebaseUser.uid
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

  const resetPassword = async (email: string) => {
    // Firebase rate-limits password reset emails natively; no extra guard needed.
    await sendPasswordResetEmail(auth, email)
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
      login, register, logout, updateProfile, refreshToken, resetPassword,
    }}>
      {children}
    </OperatorAuthContext.Provider>
  )
}
