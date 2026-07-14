"use client"

// Operator Documents — the persistent home for company verification documents.
// Registration made docs optional, so this page (plus the dashboard banner that
// links here) is where an operator sees, adds, and replaces them at any time.
// Rejected operators re-enter the admin review queue automatically once all
// three core documents exist again.

import { useCallback, useEffect, useRef, useState } from "react"
import {
  Loader2,
  FileText,
  ExternalLink,
  Upload,
  RefreshCw,
  ShieldCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useOperatorAuth } from "@/contexts/operator-auth-context"
import { kycService } from "@/lib/compliance/kyc.service"
import {
  ACCEPTED_KYC_FILE_TYPES,
  DOC_TYPE_LABELS,
  KYC_DOC_TYPES,
  validateComplianceFile,
  type ComplianceDocType,
  type ComplianceDocument,
} from "@/lib/compliance/types"

function formatUploadedAt(doc: ComplianceDocument): string | null {
  try {
    const date = doc.uploadedAt?.toDate?.()
    if (!date) return null
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return null
  }
}

interface DocCardProps {
  type: ComplianceDocType
  doc: ComplianceDocument | undefined
  busy: boolean
  error: string | undefined
  disabled: boolean
  onPick: (type: ComplianceDocType, file: File) => void
}

function DocCard({ type, doc, busy, error, disabled, onPick }: DocCardProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadedAt = doc ? formatUploadedAt(doc) : null

  return (
    <div
      className={`rounded-xl border p-4 ${
        doc ? "border-border bg-card" : "border-dashed border-border bg-muted/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            doc ? "bg-emerald-500/10" : "bg-muted"
          }`}
        >
          <FileText className={`w-4 h-4 ${doc ? "text-emerald-600" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{DOC_TYPE_LABELS[type]}</p>
          {doc ? (
            <p className="text-xs text-muted-foreground truncate">
              {doc.fileName}
              {uploadedAt && <> · uploaded {uploadedAt}</>}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">Not uploaded yet</p>
          )}
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        {doc && (
          <a
            href={doc.downloadURL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View
          </a>
        )}
        <Button
          size="sm"
          variant={doc ? "outline" : "default"}
          disabled={disabled || busy}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Uploading…
            </>
          ) : doc ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Replace
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload
            </>
          )}
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_KYC_FILE_TYPES}
        className="hidden"
        disabled={disabled || busy}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onPick(type, file)
          e.target.value = "" // allow re-picking the same file
        }}
      />
    </div>
  )
}

export function DocumentsPage() {
  const { operator, updateProfile } = useOperatorAuth()
  const [docs, setDocs] = useState<ComplianceDocument[] | null>(null)
  const [busyType, setBusyType] = useState<ComplianceDocType | null>(null)
  const [errors, setErrors] = useState<Partial<Record<ComplianceDocType, string>>>({})
  const [notice, setNotice] = useState("")

  const refresh = useCallback(async () => {
    if (!operator) return
    try {
      setDocs(await kycService.listKycDocs(operator.uid))
    } catch {
      setDocs([])
    }
  }, [operator])

  useEffect(() => {
    refresh()
  }, [refresh])

  if (!operator) return null

  const status = operator.kycStatus
  const byType = new Map((docs ?? []).map((d) => [d.type, d]))
  const missing = KYC_DOC_TYPES.filter((t) => !byType.has(t))

  const handlePick = async (type: ComplianceDocType, file: File) => {
    setNotice("")
    setErrors((e) => ({ ...e, [type]: undefined }))

    const fileError = validateComplianceFile(file)
    if (fileError) {
      setErrors((e) => ({ ...e, [type]: fileError }))
      return
    }

    setBusyType(type)
    try {
      await kycService.uploadKycDoc(operator.uid, type, file)

      // A rejected operator re-enters the review queue automatically once the
      // full set exists again (fix one document without re-uploading the rest).
      const have = new Set([...byType.keys(), type])
      if (status === "rejected" && KYC_DOC_TYPES.every((t) => have.has(t))) {
        await updateProfile({ kycStatus: "pending_verification", kycRejectionReason: "" })
        setNotice("Documents submitted — you're back in the review queue.")
      } else {
        setNotice("Document saved.")
      }
      await refresh()
    } catch (e: any) {
      setErrors((er) => ({ ...er, [type]: e?.message || "Upload failed. Please try again." }))
    } finally {
      setBusyType(null)
    }
  }

  const StatusCard = () => {
    if (status === "approved") {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Verified operator</p>
            <p className="text-muted-foreground">
              Your company is verified and your approved buses carry the Verified badge. You can
              replace a document anytime — updates don&apos;t affect your live buses, though we may
              re-review them.
            </p>
          </div>
        </div>
      )
    }
    if (status === "rejected") {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
          <div className="text-sm">
            <p className="font-semibold text-foreground">Verification was not approved</p>
            {operator.kycRejectionReason && (
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Reason:</span> {operator.kycRejectionReason}
              </p>
            )}
            <p className="text-muted-foreground">
              Replace the document(s) that caused the rejection — you re-enter the review queue
              automatically once all three are in place.
            </p>
          </div>
        </div>
      )
    }
    // pending_verification (or legacy unset)
    return (
      <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
        <Clock className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
        <div className="text-sm">
          <p className="font-semibold text-foreground">
            {missing.length === KYC_DOC_TYPES.length ? "Get verified" : "Verification in progress"}
          </p>
          <p className="text-muted-foreground">
            {missing.length === KYC_DOC_TYPES.length
              ? "Upload your three company documents to start verification. You can take walk-in bookings now — your buses appear on traveler search once you're approved."
              : missing.length > 0
                ? `We can start the review once all three documents are in. Still missing: ${missing.map((t) => DOC_TYPE_LABELS[t]).join(", ")}.`
                : "All three documents are in — we're reviewing them. Your buses go live on traveler search once you're approved."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 max-w-3xl space-y-4">
      <div>
        <h2 className="text-base font-semibold text-foreground">Company documents</h2>
        <p className="text-sm text-muted-foreground">
          Your verification documents — view, add, or replace them anytime. PDF or image, max
          300KB each. License and PAN <i>numbers</i> are edited in Settings.
        </p>
      </div>

      <StatusCard />

      {notice && (
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> {notice}
        </p>
      )}

      {docs === null ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {KYC_DOC_TYPES.map((t) => (
            <DocCard
              key={t}
              type={t}
              doc={byType.get(t)}
              busy={busyType === t}
              error={errors[t]}
              disabled={busyType !== null}
              onPick={handlePick}
            />
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Per-bus papers (route permit, insurance, fitness, pollution) will live here too once the
        document vault expands — the data model already supports them.
      </p>
    </div>
  )
}
