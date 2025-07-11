// app/operator/counter/layout.tsx
"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CounterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { operator, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !operator) {
      router.push('/operator/login')
    }
  }, [operator, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!operator) {
    return null // Will redirect to login
  }

  return <>{children}</>
}