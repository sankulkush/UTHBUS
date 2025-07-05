"use client"

import { auth, googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      if (result.user) {
        router.push("/operator/counter")
      }
    } catch (error) {
      console.error("Error signing in:", error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to UthBus</h1>
        <Button onClick={handleLogin} className="bg-red-600 hover:bg-red-700">
          Sign in with Google
        </Button>
      </div>
    </div>
  )
}