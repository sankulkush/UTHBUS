"use client"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { User, onAuthStateChanged, signOut, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, firestore as db } from "@/firebaseConfig"

export interface AdminProfile {
  uid: string
  email: string
  name?: string
  isAdmin: true
}

interface AdminAuthContextType {
  user: User | null
  admin: AdminProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider")
  return ctx
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [admin, setAdmin] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadAdminProfile = async (firebaseUser: User) => {
    const snap = await getDoc(doc(db, "admins", firebaseUser.email!))
    if (snap.exists() && snap.data()?.isAdmin === true) {
      setAdmin({ uid: firebaseUser.uid, email: firebaseUser.email!, ...snap.data() } as AdminProfile)
    } else {
      setAdmin(null)
    }
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        await loadAdminProfile(firebaseUser)
      } else {
        setUser(null)
        setAdmin(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    const snap = await getDoc(doc(db, "admins", cred.user.email!))
    if (!snap.exists() || snap.data()?.isAdmin !== true) {
      await signOut(auth)
      throw new Error("This account does not have admin access.")
    }
    setAdmin({ uid: cred.user.uid, email: cred.user.email!, ...snap.data() } as AdminProfile)
  }

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setAdmin(null)
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  return (
    <AdminAuthContext.Provider value={{ user, admin, loading, login, logout, resetPassword }}>
      {children}
    </AdminAuthContext.Provider>
  )
}
