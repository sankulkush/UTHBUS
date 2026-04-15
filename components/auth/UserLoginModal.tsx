"use client"

import React, { useState } from "react"
import { useUserAuth } from "@/contexts/user-auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface UserLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToSignup: () => void
}

export default function UserLoginModal({ isOpen, onClose, onSwitchToSignup }: UserLoginModalProps) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const { login, loginWithGoogle, loading } = useUserAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await login(formData.email, formData.password)
      onClose()
      setFormData({ email: "", password: "" })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleGoogleLogin = async () => {
    setError("")
    try {
      await loginWithGoogle()
      onClose()
    } catch (err: any) {
      setError(err.message)
    }
  }

  const handleClose = () => {
    onClose()
    setFormData({ email: "", password: "" })
    setError("")
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome back</DialogTitle>
          <DialogDescription>Sign in to your account to continue</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email" name="email" type="email" required
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password" name="password" type="password" required
              value={formData.password}
              onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
              placeholder="Your password"
            />
          </div>

          <div className="space-y-2.5">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
            <Button type="button" variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full">
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={onSwitchToSignup} className="text-primary hover:underline font-medium">
              Sign up here
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
