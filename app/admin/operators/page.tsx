"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { kycService, type OperatorRow } from "@/lib/compliance/kyc.service"
import { DOC_TYPE_LABELS, type ComplianceDocument } from "@/lib/compliance/types"
import {
  CheckCircle2, XCircle, Clock, Bus, LogOut, ChevronDown, RefreshCw, Loader2,
  BookOpen, ShieldCheck, FileText, ExternalLink, Building2, Phone, MapPin, Mail,
  Ban, PlayCircle, ScrollText,
} from "lucide-react"

type TabKey = "pending" | "approved" | "rejected" | "all"

function kycBadge(s: string | undefined) {
  if (s === "approved")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Approved</span>
  if (s === "rejected")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"><XCircle className="w-3 h-3" /> Rejected</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400"><Clock className="w-3 h-3" /> Pending</span>
}

function formatDate(ts: any): string {
  if (!ts) return "—"
  try {
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
  } catch {
    return "—"
  }
}

/** Inline preview of one stored document via its tokenised download URL. */
function DocPreview({ doc }: { doc: ComplianceDocument }) {
  const isImage = doc.contentType?.startsWith("image/")
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border">
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          <FileText className="w-3.5 h-3.5 text-muted-foreground" />
          {DOC_TYPE_LABELS[doc.type] ?? doc.type}
        </span>
        <a
          href={doc.downloadURL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 text-[11px] text-primary hover:underline"
        >
          Open <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={doc.downloadURL} alt={DOC_TYPE_LABELS[doc.type]} className="w-full max-h-64 object-contain bg-muted/30" />
      ) : (
        <iframe src={doc.downloadURL} title={doc.fileName} className="w-full h-64 bg-muted/30" />
      )}
    </div>
  )
}

export default function AdminOperatorsPage() {
  const { admin, loading: authLoading, logout } = useAdminAuth()
  const router = useRouter()

  const [operators, setOperators] = useState<OperatorRow[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<TabKey>("pending")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [docsByUid, setDocsByUid] = useState<Record<string, ComplianceDocument[] | "loading">>({})
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  useEffect(() => {
    if (!authLoading && !admin) router.replace("/admin/login")
  }, [admin, authLoading, router])

  const fetchOperators = useCallback(async () => {
    setLoading(true)
    try {
      const all = await kycService.getAllOperators()
      setOperators(all)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (admin) fetchOperators() }, [admin, fetchOperators])

  // Lazy-load an operator's documents the first time their card is expanded.
  const toggleExpand = async (uid: string) => {
    if (expandedId === uid) { setExpandedId(null); return }
    setExpandedId(uid)
    setRejectingId(null)
    if (!docsByUid[uid]) {
      setDocsByUid((m) => ({ ...m, [uid]: "loading" }))
      try {
        const docs = await kycService.listKycDocs(uid)
        setDocsByUid((m) => ({ ...m, [uid]: docs }))
      } catch (e) {
        console.error(e)
        setDocsByUid((m) => ({ ...m, [uid]: [] }))
      }
    }
  }

  const handleApprove = async (uid: string) => {
    if (!admin) return
    setActionLoading(uid)
    try {
      await kycService.approveOperator(admin.email, uid)
      await fetchOperators()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (uid: string) => {
    if (!admin || !rejectReason.trim()) return
    setActionLoading(uid)
    try {
      await kycService.rejectOperator(admin.email, uid, rejectReason.trim())
      setRejectingId(null)
      setRejectReason("")
      await fetchOperators()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const handleToggleSuspend = async (uid: string, suspend: boolean) => {
    if (!admin) return
    setActionLoading(uid)
    try {
      if (suspend) await kycService.suspendOperator(admin.email, uid)
      else await kycService.reactivateOperator(admin.email, uid)
      await fetchOperators()
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(null)
    }
  }

  const filtered = operators.filter((o) => {
    const ks = o.kycStatus ?? "pending_verification"
    if (tab === "pending") return ks === "pending_verification"
    if (tab === "approved") return ks === "approved"
    if (tab === "rejected") return ks === "rejected"
    return true
  })
  // Pending oldest-first (the review queue); others newest-first.
  filtered.sort((a, b) => {
    const at = a.createdAt?.toMillis?.() ?? 0
    const bt = b.createdAt?.toMillis?.() ?? 0
    return tab === "pending" ? at - bt : bt - at
  })

  const counts = {
    pending: operators.filter((o) => (o.kycStatus ?? "pending_verification") === "pending_verification").length,
    approved: operators.filter((o) => o.kycStatus === "approved").length,
    rejected: operators.filter((o) => o.kycStatus === "rejected").length,
    all: operators.length,
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  }
  if (!admin) return null

  const tabs: { key: TabKey; label: string }[] = [
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
    { key: "all", label: `All (${counts.all})` },
  ]

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/placeholder-logo.png" alt="UthBus" className="w-7 h-7 rounded-md object-contain" />
              <div>
                <span className="text-sm font-bold">
                  <span className="text-blue-600 dark:text-blue-400">uth</span>
                  <span className="text-primary">bus</span>
                </span>
                <span className="text-xs text-muted-foreground ml-2">Admin</span>
              </div>
            </div>
            {/* Nav */}
            <nav className="hidden sm:flex items-center gap-1 border-l border-border pl-4">
              <button
                onClick={() => router.push("/admin/buses")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Bus className="w-3.5 h-3.5" /> Buses
              </button>
              <button
                onClick={() => router.push("/admin/bookings")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Bookings
              </button>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                <ShieldCheck className="w-3.5 h-3.5" /> Operators
              </span>
              <button
                onClick={() => router.push("/admin/audit")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <ScrollText className="w-3.5 h-3.5" /> Audit
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOperators}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <span className="text-xs text-muted-foreground hidden sm:inline">{admin.email}</span>
            <button
              onClick={() => logout().then(() => router.push("/admin/login"))}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1.5 rounded-md hover:bg-destructive/10"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
        {/* Mobile nav */}
        <div className="sm:hidden flex border-t border-border">
          <button
            onClick={() => router.push("/admin/buses")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Bus className="w-3.5 h-3.5" /> Buses
          </button>
          <button
            onClick={() => router.push("/admin/bookings")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="w-3.5 h-3.5" /> Bookings
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary border-b-2 border-primary">
            <ShieldCheck className="w-3.5 h-3.5" /> Operators
          </button>
          <button
            onClick={() => router.push("/admin/audit")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ScrollText className="w-3.5 h-3.5" /> Audit
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-5 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setExpandedId(null); setRejectingId(null) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted-foreground">No operators in this view.</div>
        ) : (
          <div className="space-y-3">
            {filtered.map((op) => {
              const isExpanded = expandedId === op.uid
              const docs = docsByUid[op.uid]
              const busy = actionLoading === op.uid
              return (
                <div key={op.uid} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Summary row */}
                  <button
                    onClick={() => toggleExpand(op.uid)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                        <span className="font-semibold text-sm text-foreground truncate">{op.companyName || op.name || "Unnamed operator"}</span>
                        {kycBadge(op.kycStatus)}
                        {op.accountStatus === "suspended" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"><Ban className="w-3 h-3" /> Suspended</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {op.email} · Registered {formatDate(op.createdAt)}
                      </p>
                    </div>
                    <ChevronDown className={`w-4 h-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>

                  {/* Detail */}
                  {isExpanded && (
                    <div className="border-t border-border px-4 py-4 space-y-4">
                      {/* Company info */}
                      <div className="grid sm:grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Mail className="w-3.5 h-3.5" /> {op.email || "—"}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><Phone className="w-3.5 h-3.5" /> {op.contactNumber || op.phoneNumber || "—"}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><MapPin className="w-3.5 h-3.5" /> {op.address || "—"}</div>
                        <div className="flex items-center gap-1.5 text-muted-foreground"><FileText className="w-3.5 h-3.5" /> License: {op.licenseNumber || "—"} · PAN: {op.panNumber || "—"}</div>
                      </div>
                      {op.kycStatus === "rejected" && op.kycRejectionReason && (
                        <p className="text-xs text-destructive">Last rejection: {op.kycRejectionReason}</p>
                      )}

                      {/* Documents */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">Documents</p>
                        {docs === "loading" || docs === undefined ? (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading documents…</div>
                        ) : docs.length === 0 ? (
                          <p className="text-xs text-muted-foreground">No documents uploaded.</p>
                        ) : (
                          <div className="grid sm:grid-cols-2 gap-3">
                            {docs.map((d) => <DocPreview key={d.type} doc={d} />)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {op.kycStatus !== "approved" && (
                          <button
                            onClick={() => handleApprove(op.uid)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />} Approve
                          </button>
                        )}
                        {op.kycStatus !== "rejected" && rejectingId !== op.uid && (
                          <button
                            onClick={() => { setRejectingId(op.uid); setRejectReason("") }}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-destructive/40 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        )}

                        {/* Account suspend / reactivate (separate from KYC) */}
                        {op.accountStatus === "suspended" ? (
                          <button
                            onClick={() => handleToggleSuspend(op.uid, false)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted disabled:opacity-50"
                          >
                            <PlayCircle className="w-3.5 h-3.5" /> Reactivate account
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleSuspend(op.uid, true)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-card border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" /> Suspend account
                          </button>
                        )}

                        {/* Cross-links */}
                        <button
                          onClick={() => router.push(`/admin/buses?operator=${op.uid}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <Bus className="w-3.5 h-3.5" /> View buses
                        </button>
                        <button
                          onClick={() => router.push(`/admin/bookings?operator=${op.uid}`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                        >
                          <BookOpen className="w-3.5 h-3.5" /> View bookings
                        </button>
                      </div>

                      {/* Reject reason form */}
                      {rejectingId === op.uid && (
                        <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                          <label className="text-xs font-medium text-foreground">Reason for rejection (shown to the operator)</label>
                          <textarea
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            rows={2}
                            placeholder="e.g. Company registration certificate is illegible — please re-upload a clear copy."
                            className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-destructive"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(op.uid)}
                              disabled={busy || !rejectReason.trim()}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-destructive text-white hover:bg-destructive/90 disabled:opacity-50"
                            >
                              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Confirm rejection
                            </button>
                            <button
                              onClick={() => { setRejectingId(null); setRejectReason("") }}
                              disabled={busy}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
