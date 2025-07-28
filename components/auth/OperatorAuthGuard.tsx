"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOperatorAuth } from "@/contexts/operator-auth-context"

interface OperatorAuthGuardProps {
  children: React.ReactNode
}

export default function OperatorAuthGuard({ children }: OperatorAuthGuardProps) {
  const { operator, loading } = useOperatorAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!operator) {
        router.push("/operator/login")
      } else if (!operator.isOperator) {
        router.push("/operator/login")
      }
    }
  }, [operator, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!operator || !operator.isOperator) {
    return null
  }

  return <>{children}</>
}