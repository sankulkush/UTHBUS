"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle, FileText, ExternalLink, Upload, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { kycService } from "@/lib/compliance/kyc.service"
import { DOC_TYPE_LABELS, type ComplianceDocument } from "@/lib/compliance/types"

interface KycStatusBannerProps {
  /** Navigate to the Documents section — the home for see/add/replace. */
  onManageDocuments?: () => void
}

/**
 * Dashboard banner reflecting the operator's KYC state. Documents are optional
 * at registration, so this banner nudges toward the Documents section (the
 * actual manager) rather than hosting uploads itself:
 * - pending, no docs yet: "get verified" prompt
 * - pending, docs submitted: review-in-progress notice + submitted docs
 * - rejected: reason + link to fix the documents
 * - approved (or unset legacy): renders nothing
 */
export function KycStatusBanner({ onManageDocuments }: KycStatusBannerProps) {
  const { operator } = useOperatorAuth()
  // null = still loading (avoids flashing the "no documents" prompt)
  const [submittedDocs, setSubmittedDocs] = useState<ComplianceDocument[] | null>(null)

  const status = operator?.kycStatus

  useEffect(() => {
    if (!operator || status === "approved" || status === undefined) return
    let active = true
    kycService.listKycDocs(operator.uid)
      .then((docs) => { if (active) setSubmittedDocs(docs) })
      .catch(() => { if (active) setSubmittedDocs([]) })
    return () => { active = false }
  }, [operator, status])

  if (!operator || status === "approved" || status === undefined) return null

  const submitted = submittedDocs ?? []
  const noDocsYet = submittedDocs !== null && submitted.length === 0

  const SubmittedDocs = () =>
    submitted.length === 0 ? null : (
      <div className="mt-2 flex flex-wrap gap-2">
        {submitted.map((d) => (
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

  const ManageButton = ({ label, Icon }: { label: string; Icon: typeof Upload }) =>
    onManageDocuments ? (
      <Button size="sm" variant="outline" className="mt-2" onClick={onManageDocuments}>
        <Icon className="w-3.5 h-3.5 mr-1.5" /> {label}
      </Button>
    ) : null

  if (status === "pending_verification") {
    return (
      <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        {noDocsYet ? (
          <Upload className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        ) : (
          <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        )}
        <div className="text-sm">
          {noDocsYet ? (
            <>
              <p className="font-semibold text-foreground">Get verified — upload your documents</p>
              <p className="text-muted-foreground">
                Your account is active and you can take walk-in bookings now. Upload your
                verification documents to get verified — your buses appear on traveler search
                only after approval.
              </p>
              <ManageButton label="Upload documents" Icon={Upload} />
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground">Verification in progress</p>
              <p className="text-muted-foreground">
                We&apos;re reviewing your documents. You can manage walk-in bookings now — your buses go
                live on traveler search once you&apos;re approved.
              </p>
              <p className="text-xs font-medium text-foreground mt-2">Documents you submitted</p>
              <SubmittedDocs />
              <ManageButton label="Manage documents" Icon={FileText} />
            </>
          )}
        </div>
      </div>
    )
  }

  // status === "rejected"
  return (
    <div className="mx-4 mt-4 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
      <div className="text-sm">
        <p className="font-semibold text-foreground">Verification was not approved</p>
        {operator.kycRejectionReason ? (
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">Reason:</span> {operator.kycRejectionReason}
          </p>
        ) : (
          <p className="text-muted-foreground">Please re-upload corrected documents.</p>
        )}
        <p className="text-muted-foreground">
          Replace the affected document(s) — you re-enter the review queue automatically once all
          three are in place.
        </p>
        <p className="text-xs font-medium text-foreground mt-2">Documents you submitted</p>
        <SubmittedDocs />
        <ManageButton label="Fix documents" Icon={RefreshCw} />
      </div>
    </div>
  )
}
