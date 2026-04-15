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

interface UserSignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSwitchToLogin: () => void
}

export default function UserSignupModal({ isOpen, onClose, onSwitchToLogin }: UserSignupModalProps) {
  const [formData, setFormData] = useState({
    email: "", password: "", confirmPassword: "",
    fullName: "", phoneNumber: ""
  })
  const [error, setError] = useState("")
  const { signup, loginWithGoogle, loading } = useUserAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters"); return }
    try {
      await signup(formData.email, formData.password, {
        fullName: formData.fullName, phoneNumber: formData.phoneNumber,
      })
      onClose()
      resetForm()
    } catch (err: any) {
      setError(err.message || "Signup failed")
    }
  }

  const handleGoogleSignup = async () => {
    setError("")
    try {
      await loginWithGoogle()
      onClose()
    } catch (err: any) {
      setError(err.message || "Google signup failed")
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((p) => ({ ...p, [field]: e.target.value }))

  const resetForm = () =>
    setFormData({ email: "", password: "", confirmPassword: "", fullName: "", phoneNumber: "" })

  const handleClose = () => { onClose(); resetForm(); setError("") }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>Sign up to start booking your bus tickets</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" type="text" required value={formData.fullName} onChange={set("fullName")} placeholder="Your full name" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="su-email">Email *</Label>
            <Input id="su-email" type="email" required value={formData.email} onChange={set("email")} placeholder="your@email.com" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input id="phoneNumber" type="tel" required value={formData.phoneNumber} onChange={set("phoneNumber")} placeholder="Your phone number" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="su-password">Password *</Label>
            <Input id="su-password" type="password" required value={formData.password} onChange={set("password")} placeholder="At least 6 characters" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={set("confirmPassword")} placeholder="Confirm your password" />
          </div>

          <div className="space-y-2.5">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Account…" : "Create Account"}
            </Button>
            <Button type="button" variant="outline" onClick={handleGoogleSignup} disabled={loading} className="w-full">
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button type="button" onClick={onSwitchToLogin} className="text-primary hover:underline font-medium">
              Sign in here
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
