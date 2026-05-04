// app/operator/counter/layout.tsx
"use client"

import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CounterLayout({ children }: { children: React.ReactNode }) {
  const { operator, loading } = useOperatorAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    // Block anyone who is not a verified operator account.
    if (!operator || operator.isOperator !== true || operator.isUser !== false) {
      router.replace("/operator/login")
    }
  }, [operator, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-sm text-muted-foreground">Verifying access…</p>
        </div>
      </div>
    )
  }

  // Render nothing until role is confirmed — the useEffect handles redirect.
  if (!operator || operator.isOperator !== true || operator.isUser !== false) {
    return null
  }

  return <>{children}</>
}
