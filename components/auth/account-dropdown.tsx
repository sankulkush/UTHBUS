"use client"
import { useState } from "react"
import { signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, googleProvider, firestore, isPreviewEnvironment } from "@/firebaseConfig"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, User, LogOut, Settings, Chrome, Loader2, Bus, Shield } from "lucide-react"
import Link from "next/link"

export default function AccountDropdown() {
  const { user, userData, loading, logout, mockLogin } = useAuth()
  const [signingIn, setSigningIn] = useState(false)

  const handleGoogleSignIn = async () => {
    setSigningIn(true)
    try {
      if (isPreviewEnvironment) {
        // Mock Google sign-in for preview
        mockLogin("user")
      } else {
        const result = await signInWithPopup(auth, googleProvider)
        const user = result.user

        // Check if user document exists
        const userDoc = await getDoc(doc(firestore, "users", user.uid))

        if (!userDoc.exists()) {
          // Create user document
          await setDoc(doc(firestore, "users", user.uid), {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            role: "user",
            createdAt: new Date(),
            photoURL: user.photoURL,
          })
        }
      }
    } catch (error: any) {
      console.error("Error signing in:", error)
      alert("Failed to sign in. Please try again.")
    } finally {
      setSigningIn(false)
    }
  }

  if (loading) {
    return (
      <Button variant="ghost" className="flex items-center space-x-2" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </Button>
    )
  }

  if (!user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
          >
            <User className="w-4 h-4" />
            <span>Account</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Sign In Options</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleGoogleSignIn} disabled={signingIn} className="cursor-pointer">
            <Chrome className="w-4 h-4 mr-2" />
            {signingIn ? "Signing in..." : "Continue with Google"}
          </DropdownMenuItem>

          {isPreviewEnvironment && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-500">Demo Logins</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => mockLogin("user")} className="cursor-pointer">
                <User className="w-4 h-4 mr-2" />
                Demo User
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => mockLogin("operator")} className="cursor-pointer">
                <Bus className="w-4 h-4 mr-2" />
                Demo Operator
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => mockLogin("admin")} className="cursor-pointer">
                <Shield className="w-4 h-4 mr-2" />
                Demo Admin
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/operator/login" className="cursor-pointer">
              <Bus className="w-4 h-4 mr-2" />
              Operator Login
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center space-x-2 px-2 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
        >
          <Avatar className="w-8 h-8">
            <AvatarImage src={userData?.photoURL || user.photoURL || ""} alt={userData?.displayName || "User"} />
            <AvatarFallback className="bg-blue-500 text-white text-sm">
              {(userData?.displayName || user.displayName || user.email || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="text-sm font-medium">{userData?.displayName || user.displayName || "User"}</span>
            <span className="text-xs text-gray-500 capitalize">{userData?.role || "user"}</span>
          </div>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userData?.displayName || user.displayName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {userData?.role === "user" && (
          <DropdownMenuItem asChild>
            <Link href="/user" className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              My Dashboard
            </Link>
          </DropdownMenuItem>
        )}

        {userData?.role === "operator" && userData.approved && (
          <DropdownMenuItem asChild>
            <Link href="/operator/counter" className="cursor-pointer">
              <Bus className="w-4 h-4 mr-2" />
              Counter Portal
            </Link>
          </DropdownMenuItem>
        )}

        {userData?.role === "admin" && (
          <DropdownMenuItem asChild>
            <Link href="/admin" className="cursor-pointer">
              <Shield className="w-4 h-4 mr-2" />
              Admin Panel
            </Link>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem className="cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
