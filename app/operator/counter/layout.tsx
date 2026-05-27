// app/operator/counter/layout.tsx
"use client"

import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { useUserAuth } from "@/contexts/user-auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

async function clearAuthCookie() {
  try { await fetch("/api/auth/clear-token", { method: "POST" }) } catch { /* optional */ }
}

export default function CounterLayout({ children }: { children: React.ReactNode }) {
  const { operator, loading: operatorLoading } = useOperatorAuth()
  const { userProfile, loading: userLoading } = useUserAuth()
  const router = useRouter()
  const loading = operatorLoading || userLoading

  const isUserLoggedIn = !!userProfile && userProfile.isUser === true && userProfile.isOperator === false
  const isOperatorLoggedIn = !!operator && operator.isOperator === true && operator.isUser === false

  useEffect(() => {
    if (loading) return
    // Regular users have no business in the counter portal — bounce to homepage.
    if (isUserLoggedIn) {
      router.replace("/")
      return
    }
    // Not a verified operator: clear the stale cookie before redirecting to login so
    // the middleware doesn't immediately bounce them back here (redirect loop).
    if (!isOperatorLoggedIn) {
      clearAuthCookie().then(() => router.replace("/operator/login"))
    }
  }, [loading, isUserLoggedIn, isOperatorLoggedIn, router])

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
  if (!isOperatorLoggedIn) {
    return null
  }

  return <>{children}</>
}
