"use client"

import React, { useState } from "react"
import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { PasswordInput } from "@/components/ui/password-input"

type View = "login" | "forgot"

export default function OperatorLogin() {
  const { login, resetPassword, loading } = useOperatorAuth()
  const [view, setView] = useState<View>("login")
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [resetEmail, setResetEmail] = useState("")
  const [error, setError] = useState("")
  const [resetSent, setResetSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(formData.email, formData.password)
    } catch (err: any) {
      setError(err.message || "Invalid email or password")
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!resetEmail.trim()) {
      setError("Please enter your email address.")
      return
    }
    setResetLoading(true)
    try {
      await resetPassword(resetEmail.trim())
      setResetSent(true)
    } catch (err: any) {
      // Translate Firebase error codes into readable messages
      if (err.code === "auth/user-not-found") {
        setError("No operator account found for this email.")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.")
      } else {
        setError(err.message || "Failed to send reset email. Please try again.")
      }
    } finally {
      setResetLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const switchToForgot = () => {
    setError("")
    setResetSent(false)
    setResetEmail(formData.email) // pre-fill with whatever they typed
    setView("forgot")
  }

  const switchToLogin = () => {
    setError("")
    setResetSent(false)
    setView("login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-2 text-2xl font-extrabold tracking-tight">
            <span className="text-blue-600 dark:text-blue-400">uth</span>
            <span className="text-primary">bus</span>
          </div>
          <CardTitle className="text-xl font-bold">
            {view === "login" ? "Operator Login" : "Reset Password"}
          </CardTitle>
          <CardDescription>
            {view === "login"
              ? "Sign in to your operator account"
              : "Enter your registered email to receive a password reset link"}
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
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={switchToForgot}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in…" : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/operator/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {resetSent ? (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  Reset link sent! Check your inbox (and spam folder) for{" "}
                  <span className="font-semibold">{resetEmail}</span>.
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label htmlFor="resetEmail">Registered Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              )}

              {!resetSent && (
                <Button type="submit" disabled={resetLoading} className="w-full">
                  {resetLoading ? "Sending…" : "Send Reset Link"}
                </Button>
              )}

              <button
                type="button"
                onClick={switchToLogin}
                className="w-full text-center text-sm text-primary hover:underline font-medium"
              >
                ← Back to login
              </button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
