"use client"

import { AuthGuard } from "@/components/Auth/auth-gaurd"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function OperatorPortal() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to counter page directly
    router.push("/operator/counter")
  }, [router])

  return (
    <AuthGuard requiredRole="operator" requireApproval={true}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    </AuthGuard>
  )
}
