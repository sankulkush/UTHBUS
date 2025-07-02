"use client"

import { useState } from "react"
import { signInWithPopup } from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, googleProvider, firestore } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome } from "lucide-react"

export default function UserLogin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError("")

    try {
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

      router.push("/user")
    } catch (error: any) {
      console.error("Error signing in:", error)
      setError(error.message || "Failed to sign in")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to book bus tickets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">{error}</div>}

          <Button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-transparent"
            variant="outline"
          >
            <Chrome className="w-5 h-5" />
            {loading ? "Signing in..." : "Continue with Google"}
          </Button>

          <div className="text-center text-sm text-gray-600">
            New to Nepal Bus Booking?{" "}
            <a href="/" className="text-blue-600 hover:underline">
              Go to Homepage
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
