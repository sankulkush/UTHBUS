"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, firestore, isPreviewEnvironment } from "@/firebaseConfig"

interface UserData {
  uid: string
  email: string
  displayName: string
  role: "user" | "operator" | "admin"
  approved?: boolean
  photoURL?: string
  createdAt: Date
  companyName?: string
  contactNumber?: string
  address?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  logout: () => Promise<void>
  mockLogin: (role: "user" | "operator" | "admin") => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user data for preview environment
const createMockUser = (role: "user" | "operator" | "admin"): User => ({
  uid: `mock-${role}-123`,
  email: `${role}@example.com`,
  displayName: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
  emailVerified: true,
  isAnonymous: false,
  metadata: {} as any,
  providerData: [],
  refreshToken: "",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "mock-token",
  getIdTokenResult: async () => ({}) as any,
  reload: async () => {},
  toJSON: () => ({}),
  photoURL: null,
  phoneNumber: null,
  providerId: "mock",
})

const createMockUserData = (role: "user" | "operator" | "admin"): UserData => ({
  uid: `mock-${role}-123`,
  email: `${role}@example.com`,
  displayName: `Mock ${role.charAt(0).toUpperCase() + role.slice(1)}`,
  role,
  approved: role === "operator" ? true : undefined,
  createdAt: new Date(),
  companyName: role === "operator" ? "Demo Bus Company" : undefined,
  contactNumber: role === "operator" ? "+977-1234567890" : undefined,
  address: role === "operator" ? "Kathmandu, Nepal" : undefined,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock login function for preview environment
  const mockLogin = (role: "user" | "operator" | "admin") => {
    if (isPreviewEnvironment) {
      const mockUser = createMockUser(role)
      const mockUserData = createMockUserData(role)
      setUser(mockUser)
      setUserData(mockUserData)
      localStorage.setItem("mockAuth", JSON.stringify({ user: mockUser, userData: mockUserData }))
    }
  }

  useEffect(() => {
    // In preview environment, check for mock auth
    if (isPreviewEnvironment) {
      const mockAuth = localStorage.getItem("mockAuth")
      if (mockAuth) {
        try {
          const { user: mockUser, userData: mockUserData } = JSON.parse(mockAuth)
          setUser(mockUser)
          setUserData(mockUserData)
        } catch (error) {
          console.error("Error parsing mock auth:", error)
        }
      }
      setLoading(false)
      return
    }

    // Real Firebase auth
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        try {
          // Try to get user data from users collection first
          let userDoc = await getDoc(doc(firestore, "users", user.uid))

          if (userDoc.exists()) {
            setUserData(userDoc.data() as UserData)
          } else {
            // Try operators collection
            userDoc = await getDoc(doc(firestore, "operators", user.uid))
            if (userDoc.exists()) {
              setUserData(userDoc.data() as UserData)
            } else {
              setUserData(null)
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          setUserData(null)
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const logout = async () => {
    try {
      if (isPreviewEnvironment) {
        localStorage.removeItem("mockAuth")
        setUser(null)
        setUserData(null)
      } else {
        await signOut(auth)
      }
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <AuthContext.Provider value={{ user, userData, loading, logout, mockLogin }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
