"use client"

import type React from "react"
import { useState } from "react"
import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BusIcon, ArrowLeft, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PasswordInput } from "@/components/ui/password-input"
import { KycDocInput } from "@/components/operator/kyc/KycDocInput"
import { kycService } from "@/lib/compliance/kyc.service"
import { DOC_TYPE_LABELS, validateComplianceFile } from "@/lib/compliance/types"

export default function OperatorRegister() {
  const { register } = useOperatorAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactNumber: "",
    address: "",
    description: "",
    licenseNumber: "",
    panNumber: "",
  })
  // KYC documents — all three required at registration (companyCert/license/pan).
  const [docs, setDocs] = useState<{ companyCert: File | null; license: File | null; pan: File | null }>({
    companyCert: null,
    license: null,
    pan: null,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.companyName) {
      setError("Please fill in all required fields")
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return false
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address")
      return false
    }

    if (!formData.licenseNumber || !formData.panNumber) {
      setError("Please enter your operator license and PAN/VAT numbers")
      return false
    }

    // All three documents required, each within type/size limits.
    for (const [key, label] of [
      ["companyCert", DOC_TYPE_LABELS.companyCert],
      ["license", DOC_TYPE_LABELS.license],
      ["pan", DOC_TYPE_LABELS.pan],
    ] as const) {
      const file = docs[key]
      if (!file) {
        setError(`Please upload your ${label}`)
        return false
      }
      const fileError = validateComplianceFile(file)
      if (fileError) {
        setError(`${label}: ${fileError}`)
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const uid = await register(formData.email, formData.password, {
        companyName: formData.companyName,
        contactNumber: formData.contactNumber,
        address: formData.address,
        description: formData.description,
        name: formData.companyName, // Use company name as the operator name
        phoneNumber: formData.contactNumber,
        licenseNumber: formData.licenseNumber,
        panNumber: formData.panNumber,
      })

      // Upload the three KYC documents under the new operator's uid. The account
      // already exists at this point, so a later upload failure leaves a
      // recoverable state (operator can re-upload from their dashboard).
      await Promise.all([
        kycService.uploadKycDoc(uid, "companyCert", docs.companyCert!),
        kycService.uploadKycDoc(uid, "license", docs.license!),
        kycService.uploadKycDoc(uid, "pan", docs.pan!),
      ])

      setSuccess(true)

      // Account created + docs uploaded — head to the dashboard (KYC banner shows there).
      setTimeout(() => {
        router.push("/operator/counter")
      }, 2000)
    } catch (error: any) {
      console.error("Registration error:", error)

      let errorMessage = "Registration failed. Please try again."

      // Handle specific Firebase errors
      if (error.message.includes("auth/email-already-in-use")) {
        errorMessage = "An account with this email already exists. Please use a different email or sign in."
      } else if (error.message.includes("auth/invalid-email")) {
        errorMessage = "Please enter a valid email address."
      } else if (error.message.includes("auth/weak-password")) {
        errorMessage = "Password is too weak. Please use at least 6 characters."
      } else if (error.message.includes("auth/network-request-failed")) {
        errorMessage = "Network error. Please check your internet connection and try again."
      } else if (error.message.includes("auth/too-many-requests")) {
        errorMessage = "Too many failed attempts. Please try again later."
      } else {
        errorMessage = error.message || errorMessage
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Account created!</h2>
            <p className="text-muted-foreground mb-4">
              Your documents are in for verification. We&apos;ll review them shortly — your buses go
              live on search once you&apos;re approved. Taking you to your dashboard…
            </p>
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30 bg-doodle pt-16">
      <div className="max-w-md md:max-w-2xl mx-auto px-4 py-10">

        {/* Back + title — icon-only back button sits left of the heading */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            aria-label="Back to home"
            title="Back to home"
            className="shrink-0 w-9 h-9 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold text-foreground leading-tight">List your buses on UthBus</h1>
            <p className="text-sm text-muted-foreground">Create your operator account in a couple of minutes.</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BusIcon className="w-5 h-5 text-primary" />
              <span>Operator details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="operator@example.com"
                />
              </div>

              {/* Passwords — paired on wider screens */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <PasswordInput
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength={6}
                    placeholder="At least 6 characters"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <PasswordInput
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength={6}
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Your Bus Company Name"
                />
              </div>

              {/* Contact + address — paired on wider screens */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactNumber">Contact Number</Label>
                  <Input
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="+977-1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Company Address"
                  />
                </div>
              </div>

              {/* License + PAN/VAT — paired on wider screens */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Operator License Number *</Label>
                  <Input
                    id="licenseNumber"
                    name="licenseNumber"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="e.g. DoTM-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN / VAT Number *</Label>
                  <Input
                    id="panNumber"
                    name="panNumber"
                    value={formData.panNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="e.g. 301234567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Company Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  disabled={loading}
                  placeholder="Brief description of your bus service"
                />
              </div>

              {/* Verification documents — required for KYC. */}
              <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">Verification documents</p>
                    <p className="text-xs text-muted-foreground">
                      Required to verify your company. Your buses go live on search once we approve these.
                      PDF or image, max 5MB each.
                    </p>
                  </div>
                </div>
                <KycDocInput
                  type="companyCert"
                  label={DOC_TYPE_LABELS.companyCert}
                  value={docs.companyCert}
                  onChange={(file) => setDocs((d) => ({ ...d, companyCert: file }))}
                  disabled={loading}
                  required
                />
                <KycDocInput
                  type="license"
                  label={DOC_TYPE_LABELS.license}
                  value={docs.license}
                  onChange={(file) => setDocs((d) => ({ ...d, license: file }))}
                  disabled={loading}
                  required
                />
                <KycDocInput
                  type="pan"
                  label={DOC_TYPE_LABELS.pan}
                  value={docs.pan}
                  onChange={(file) => setDocs((d) => ({ ...d, pan: file }))}
                  disabled={loading}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account…</span>
                  </div>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <Link href="/operator/login" className="text-primary hover:underline text-sm">
                Already have an account? Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}