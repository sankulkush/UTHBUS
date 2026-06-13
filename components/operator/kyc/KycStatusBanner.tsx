"use client"

import { useState, useEffect } from "react"
import { Clock, AlertTriangle, Loader2, RefreshCw, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { kycService } from "@/lib/compliance/kyc.service"
import { KycDocInput } from "./KycDocInput"
import { DOC_TYPE_LABELS, validateComplianceFile, type ComplianceDocument } from "@/lib/compliance/types"

/**
 * Dashboard banner reflecting the operator's KYC state.
 * - pending_verification: review-in-progress notice
 * - rejected: reason + inline re-upload (re-submitting puts them back in the queue)
 * - approved (or unset legacy): renders nothing
 */
export function KycStatusBanner() {
  const { operator, updateProfile } = useOperatorAuth()
  const [reuploadOpen, setReuploadOpen] = useState(false)
  const [docs, setDocs] = useState<{ companyCert: File | null; license: File | null; pan: File | null }>({
    companyCert: null,
    license: null,
    pan: null,
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [submittedDocs, setSubmittedDocs] = useState<ComplianceDocument[]>([])

  const status = operator?.kycStatus

  // Load the operator's submitted documents so they can see/verify what they
  // uploaded during onboarding. Re-runs when status flips (e.g. after re-upload).
  useEffect(() => {
    if (!operator || status === "approved" || status === undefined) return
    let active = true
    kycService.listKycDocs(operator.uid)
      .then((docs) => { if (active) setSubmittedDocs(docs) })
      .catch(() => { if (active) setSubmittedDocs([]) })
    return () => { active = false }
  }, [operator, status])

  if (!operator || status === "approved" || status === undefined) return null

  const SubmittedDocs = () =>
    submittedDocs.length === 0 ? null : (
      <div className="mt-2 flex flex-wrap gap-2">
        {submittedDocs.map((d) => (
          <a
            key={d.type}
            href={d.downloadURL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
            title={`View your ${DOC_TYPE_LABELS[d.type]}`}
          >
            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
            {DOC_TYPE_LABELS[d.type]}
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        ))}
      </div>
    )

  if (status === "pending_verification") {
    return (
      <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">Verification in progress</p>
          <p className="text-muted-foreground">
            We&apos;re reviewing your documents. You can manage walk-in bookings now — your buses go
            live on traveler search once you&apos;re approved.
          </p>
          <p className="text-xs font-medium text-foreground mt-2">Documents you submitted</p>
          <SubmittedDocs />
        </div>
      </div>
    )
  }

  // status === "rejected"
  const handleResubmit = async () => {
    setError("")
    for (const [key, label] of [
      ["companyCert", DOC_TYPE_LABELS.companyCert],
      ["license", DOC_TYPE_LABELS.license],
      ["pan", DOC_TYPE_LABELS.pan],
    ] as const) {
      const file = docs[key]
      if (!file) {
        setError(`Please upload your ${label}`)
        return
      }
      const fileError = validateComplianceFile(file)
      if (fileError) {
        setError(`${label}: ${fileError}`)
        return
      }
    }

    setSubmitting(true)
    try {
      await Promise.all([
        kycService.uploadKycDoc(operator.uid, "companyCert", docs.companyCert!),
        kycService.uploadKycDoc(operator.uid, "license", docs.license!),
        kycService.uploadKycDoc(operator.uid, "pan", docs.pan!),
      ])
      // Re-enter the admin review queue and clear the prior rejection reason.
      await updateProfile({ kycStatus: "pending_verification", kycRejectionReason: "" })
      setReuploadOpen(false)
      setDocs({ companyCert: null, license: null, pan: null })
    } catch (e: any) {
      setError(e?.message || "Could not re-submit. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-4 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
        <div className="flex-1 text-sm">
          <p className="font-semibold text-foreground">Verification was not approved</p>
          {operator.kycRejectionReason ? (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Reason:</span> {operator.kycRejectionReason}
            </p>
          ) : (
            <p className="text-muted-foreground">Please re-upload corrected documents.</p>
          )}
          {!reuploadOpen && (
            <>
              <p className="text-xs font-medium text-foreground mt-2">Documents you submitted</p>
              <SubmittedDocs />
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setReuploadOpen(true)}>
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Re-upload documents
              </Button>
            </>
          )}
        </div>
      </div>

      {reuploadOpen && (
        <div className="mt-3 space-y-3 border-t border-destructive/20 pt-3">
          {error && <p className="text-xs text-destructive">{error}</p>}
          <KycDocInput
            type="companyCert"
            label={DOC_TYPE_LABELS.companyCert}
            value={docs.companyCert}
            onChange={(file) => setDocs((d) => ({ ...d, companyCert: file }))}
            disabled={submitting}
            required
          />
          <KycDocInput
            type="license"
            label={DOC_TYPE_LABELS.license}
            value={docs.license}
            onChange={(file) => setDocs((d) => ({ ...d, license: file }))}
            disabled={submitting}
            required
          />
          <KycDocInput
            type="pan"
            label={DOC_TYPE_LABELS.pan}
            value={docs.pan}
            onChange={(file) => setDocs((d) => ({ ...d, pan: file }))}
            disabled={submitting}
            required
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleResubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit for review"
              )}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setReuploadOpen(false)} disabled={submitting}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
