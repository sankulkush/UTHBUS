"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"

type View = "login" | "forgot"

export default function AdminLogin() {
  const { login, resetPassword, admin, loading } = useAdminAuth()
  const router = useRouter()
  const [view, setView] = useState<View>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && admin) router.replace("/admin/buses")
  }, [admin, loading, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await login(email, password)
      router.replace("/admin/buses")
    } catch (err: any) {
      setError(err.message || "Invalid credentials")
    } finally {
      setSubmitting(false)
    }
  }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await resetPassword(email)
      setResetSent(true)
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.")
      } else {
        setError(err.message || "Failed to send reset email.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const switchToForgot = () => {
    setError("")
    setResetSent(false)
    setView("forgot")
  }

  const switchToLogin = () => {
    setError("")
    setResetSent(false)
    setView("login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mb-2 text-2xl font-extrabold tracking-tight">
            <span className="text-blue-600 dark:text-blue-400">uth</span>
            <span className="text-primary">bus</span>
          </div>
          <CardTitle className="text-xl font-bold">
            {view === "login" ? "Admin Portal" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {view === "login"
              ? "Sign in with your UthBus admin account"
              : "Enter your admin email to receive a reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {view === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@uthbus.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={submitting || loading} className="w-full">
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="text-primary hover:underline font-medium"
                >
                  Forgot password?
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleForgot} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
              {resetSent ? (
                <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  Reset link sent to <strong>{email}</strong>. Check your inbox.
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@uthbus.com"
                    autoFocus
                  />
                </div>
              )}
              {!resetSent && (
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Sending…" : "Send Reset Link"}
                </Button>
              )}
              <p className="text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="text-primary hover:underline font-medium"
                >
                  ← Back to login
                </button>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
