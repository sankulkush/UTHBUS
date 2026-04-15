"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUserAuth } from "@/contexts/user-auth-context"
import { Loader2 } from "lucide-react"

// The real user dashboard lives at /user/bookings via the layout.
// This page redirects there; if somehow reached unauthenticated,
// UserAuthGuard in the layout handles the redirect to login.
export default function UserIndexPage() {
  const { userProfile, loading } = useUserAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      router.replace("/user/bookings")
    }
  }, [loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  )
}
