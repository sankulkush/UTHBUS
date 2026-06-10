"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUserAuth } from "@/contexts/user-auth-context"
import UserLoginModal from "./UserLoginModal"
import UserSignupModal from "./UserSignupModal"

interface UserAuthGuardProps {
  children: React.ReactNode
  redirectTo?: string
  // Where to send a guest who dismisses the login modal without signing in.
  // Default behaviour leaves them on a blank page; callers like /booking
  // pass "/" so they aren't stranded.
  redirectOnDismiss?: string
}

export default function UserAuthGuard({ children, redirectTo = "/", redirectOnDismiss }: UserAuthGuardProps) {
  const { userProfile, loading } = useUserAuth()
  const router = useRouter()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  // True when a modal close was just requested. A useEffect resolves whether
  // it was a successful login (userProfile now set → ignore) or a real dismiss
  // (userProfile still null → redirect). This is necessary because the modal
  // calls onClose() synchronously right after the auth context's setUserProfile,
  // and React hasn't committed the state update yet — checking userProfile
  // inside onClose would always see the pre-login (null) value.
  const [closeRequested, setCloseRequested] = useState(false)

  useEffect(() => {
    if (!loading && !userProfile) {
      if (redirectTo === "/") {
        setShowLoginModal(true)
      } else {
        router.push(redirectTo)
      }
    }
  }, [userProfile, loading, router, redirectTo])

  useEffect(() => {
    if (!closeRequested) return
    setCloseRequested(false)
    if (!loading && !userProfile && redirectOnDismiss) {
      router.push(redirectOnDismiss)
    }
  }, [closeRequested, userProfile, loading, redirectOnDismiss, router])

  const requestClose = (close: () => void) => () => {
    close()
    setCloseRequested(true)
  }

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
          onClose={requestClose(() => setShowLoginModal(false))}
          onSwitchToSignup={() => {
            setShowLoginModal(false)
            setShowSignupModal(true)
          }}
        />
        <UserSignupModal
          isOpen={showSignupModal}
          onClose={requestClose(() => setShowSignupModal(false))}
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