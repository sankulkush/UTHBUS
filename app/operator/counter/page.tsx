// app/operator/counter/page.tsx
"use client"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CounterDashboard() {
  const { operator, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!operator) {
    router.push('/operator/login')
    return null
  }

  return (
    <div>
      <h1>Welcome to Counter Dashboard</h1>
      <p>Hello, {operator.name}!</p>
      {/* Your existing counter content */}
    </div>
  )
}