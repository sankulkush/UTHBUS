// app/operator/layout.tsx
"use client"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
      <Toaster />
    </AuthProvider>
  )
}