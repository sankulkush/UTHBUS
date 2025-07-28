"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserAuth } from "@/contexts/user-auth-context"
import UserLoginModal from "./UserLoginModal"
import UserSignupModal from "./UserSignupModal"

interface UserAuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
}

export default function UserAuthGuard({ children, redirectTo = "/" }: UserAuthGuardProps) {
  const { userProfile, loading } = useUserAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  useEffect(() => {
    if (!loading && !userProfile) {
      if (redirectTo === "/") {
        setShowLoginModal(true)
      } else {
        router.push(redirectTo)
      }
    }
  }, [userProfile, loading, router, redirectTo])

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

  if (!userProfile) {
    return (
      <>
        <UserLoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false)
            setShowSignupModal(true)
          }}
        />
        <UserSignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false)
            setShowLoginModal(true)
          }}
        />
        {redirectTo !== "/" && null}
      </>
    )
  }

  return <>{children}</>
}