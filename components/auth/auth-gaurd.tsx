"use client"

import type React from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "user" | "operator" | "admin"
  requireApproval?: boolean
}

export function AuthGuard({ children, requiredRole, requireApproval = false }: AuthGuardProps) {
  const { user, userData, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to appropriate login page based on required role
        if (requiredRole === "operator") {
          router.push("/operator/login")
        } else if (requiredRole === "admin") {
          router.push("/admin/login")
        } else {
          router.push("/user/login")
        }
        return
      }

      if (userData) {
        // Check role
        if (requiredRole && userData.role !== requiredRole) {
          router.push("/unauthorized")
          return
        }

        // Check approval for operators
        if (requireApproval && userData.role === "operator" && !userData.approved) {
          router.push("/operator/pending-approval")
          return
        }
      }
    }
  }, [user, userData, loading, requiredRole, requireApproval, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || (requiredRole && userData?.role !== requiredRole)) {
    return null
  }

  if (requireApproval && userData?.role === "operator" && !userData.approved) {
    return null
  }

  return <>{children}</>
}
