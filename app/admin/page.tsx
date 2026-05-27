"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"

export default function AdminRoot() {
  const { admin, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (admin) router.replace("/admin/buses")
    else router.replace("/admin/login")
  }, [admin, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  )
}
