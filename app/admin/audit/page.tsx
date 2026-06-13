"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { kycService, type AuditLogEntry } from "@/lib/compliance/kyc.service"
import {
  Bus, BookOpen, ShieldCheck, ScrollText, LogOut, RefreshCw, Loader2,
  CheckCircle2, XCircle, Ban, PlayCircle,
} from "lucide-react"

/** Human-readable label + icon for an audit action code. */
function actionMeta(action: string | undefined) {
  switch (action) {
    case "kyc_approved":         return { label: "KYC approved", cls: "text-green-700 dark:text-green-400", Icon: CheckCircle2 }
    case "kyc_rejected":         return { label: "KYC rejected", cls: "text-red-700 dark:text-red-400", Icon: XCircle }
    case "account_suspended":    return { label: "Account suspended", cls: "text-red-700 dark:text-red-400", Icon: Ban }
    case "account_reactivated":  return { label: "Account reactivated", cls: "text-foreground", Icon: PlayCircle }
    default:                     return { label: action || "—", cls: "text-muted-foreground", Icon: ScrollText }
  }
}

function formatWhen(ts: any): string {
  if (!ts) return "—"
  try {
    const d = typeof ts.toDate === "function" ? ts.toDate() : new Date(ts)
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
  } catch {
    return "—"
  }
}

export default function AdminAuditPage() {
  const { admin, loading: authLoading, logout } = useAdminAuth()
  const router = useRouter()

  const [entries, setEntries] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !admin) router.replace("/admin/login")
  }, [admin, authLoading, router])

  const fetchLog = useCallback(async () => {
    setLoading(true)
    try {
      setEntries(await kycService.getAuditLog())
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (admin) fetchLog() }, [admin, fetchLog])

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  }
  if (!admin) return null

  const navBtn = (path: string, Icon: any, label: string, active = false) => (
    active ? (
      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
        <Icon className="w-3.5 h-3.5" /> {label}
      </span>
    ) : (
      <button
        onClick={() => router.push(path)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Icon className="w-3.5 h-3.5" /> {label}
      </button>
    )
  )

  return (
    <div className="min-h-screen bg-muted/30">
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
            <nav className="hidden sm:flex items-center gap-1 border-l border-border pl-4">
              {navBtn("/admin/buses", Bus, "Buses")}
              {navBtn("/admin/bookings", BookOpen, "Bookings")}
              {navBtn("/admin/operators", ShieldCheck, "Operators")}
              {navBtn("/admin/audit", ScrollText, "Audit", true)}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLog} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Refresh">
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
          {navBtn("/admin/buses", Bus, "Buses")}
          {navBtn("/admin/bookings", BookOpen, "Bookings")}
          {navBtn("/admin/operators", ShieldCheck, "Operators")}
          {navBtn("/admin/audit", ScrollText, "Audit", true)}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <ScrollText className="w-4 h-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold text-foreground">Admin activity log</h1>
          <span className="text-xs text-muted-foreground">· most recent {entries.length}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted-foreground">No admin actions recorded yet.</div>
        ) : (
          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {entries.map((e) => {
              const { label, cls, Icon } = actionMeta(e.action)
              return (
                <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${cls}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${cls}`}>{label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Operator <span className="font-mono">{e.operatorUid || "—"}</span>
                      {e.reason ? <> · {e.reason}</> : null}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{formatWhen(e.timestamp)}</p>
                    <p className="text-[10px] text-muted-foreground/70 truncate max-w-[160px]">{e.adminEmail || "—"}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
