"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { Loader2 } from "lucide-react"

interface OperatorAuthWrapperProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function OperatorAuthWrapper({ 
  children, 
  redirectTo = "/operator/login" 
}: OperatorAuthWrapperProps) {
  const { user, operator, loading } = useOperatorAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user || !operator || !operator.isOperator) {
        router.push(redirectTo)
      }
    }
  }, [user, operator, loading, router, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !operator || !operator.isOperator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}