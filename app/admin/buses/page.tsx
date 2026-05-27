"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { BusService } from "@/components/operator/counter/services/bus.service"
import type { IBus } from "@/components/operator/counter/types/counter.types"
import {
  CheckCircle2, XCircle, Clock, Bus, MapPin, LogOut,
  ChevronDown, RefreshCw, Loader2, PauseCircle, PlayCircle, Trash2,
  BookOpen, AlertTriangle,
} from "lucide-react"

const busService = new BusService()

type TabKey = "pending" | "approved" | "suspended" | "rejected" | "all"

function verificationBadge(s: string | undefined) {
  if (s === "approved")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Approved</span>
  if (s === "rejected")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"><XCircle className="w-3 h-3" /> Rejected</span>
  if (s === "suspended")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400"><PauseCircle className="w-3 h-3" /> Suspended</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400"><Clock className="w-3 h-3" /> Pending</span>
}

export default function AdminBusesPage() {
  const { admin, loading: authLoading, logout } = useAdminAuth()
  const router = useRouter()

  const [buses, setBuses] = useState<IBus[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tab, setTab] = useState<TabKey>("pending")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !admin) router.replace("/admin/login")
  }, [admin, authLoading, router])

  const fetchBuses = useCallback(async () => {
    setLoading(true)
    try {
      const all = await busService.getAllBusesForAdmin()
      setBuses(all)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (admin) fetchBuses() }, [admin, fetchBuses])

  const handleVerify = async (busId: string, decision: "approved" | "rejected") => {
    setActionLoading(busId)
    try {
      await busService.verifyBus(busId, decision)
      await fetchBuses()
    } finally {
      setActionLoading(null)
    }
  }

  const handleHold = async (busId: string) => {
    setActionLoading(busId)
    try {
      await busService.holdBus(busId)
      await fetchBuses()
    } finally {
      setActionLoading(null)
    }
  }

  const handleUnhold = async (busId: string) => {
    setActionLoading(busId)
    try {
      await busService.unholdBus(busId)
      await fetchBuses()
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (busId: string) => {
    setActionLoading(busId)
    try {
      await busService.adminDeleteBus(busId)
      setExpandedId(null)
      setConfirmDelete(null)
      await fetchBuses()
    } finally {
      setActionLoading(null)
    }
  }

  const filteredBuses = buses.filter((b) => {
    const vs = b.verificationStatus ?? "pending_verification"
    if (tab === "pending") return vs === "pending_verification"
    if (tab === "approved") return vs === "approved"
    if (tab === "suspended") return vs === "suspended"
    if (tab === "rejected") return vs === "rejected"
    return true
  })

  const counts = {
    pending: buses.filter((b) => (b.verificationStatus ?? "pending_verification") === "pending_verification").length,
    approved: buses.filter((b) => b.verificationStatus === "approved").length,
    suspended: buses.filter((b) => b.verificationStatus === "suspended").length,
    rejected: buses.filter((b) => b.verificationStatus === "rejected").length,
    all: buses.length,
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  }
  if (!admin) return null

  const tabs: { key: TabKey; label: string }[] = [
    { key: "pending", label: `Pending (${counts.pending})` },
    { key: "approved", label: `Approved (${counts.approved})` },
    { key: "suspended", label: `Suspended (${counts.suspended})` },
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
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                <Bus className="w-3.5 h-3.5" /> Buses
              </span>
              <button
                onClick={() => router.push("/admin/bookings")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" /> Bookings
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBuses}
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
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary border-b-2 border-primary"
          >
            <Bus className="w-3.5 h-3.5" /> Buses
          </button>
          <button
            onClick={() => router.push("/admin/bookings")}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <BookOpen className="w-3.5 h-3.5" /> Bookings
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-foreground">Bus Management</h1>
          <p className="text-sm text-muted-foreground">Review, approve, suspend, and remove buses submitted by operators.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit overflow-x-auto">
          {tabs.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${tab === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredBuses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bus className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {tab === "pending" ? "No buses awaiting verification" : `No ${tab} buses`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBuses.map((bus) => {
              const isExpanded = expandedId === bus.id
              const vs = bus.verificationStatus ?? "pending_verification"
              const isPending = vs === "pending_verification"
              const isApproved = vs === "approved"
              const isSuspended = vs === "suspended"
              const isDeleting = confirmDelete === bus.id
              return (
                <div key={bus.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : bus.id)}
                  >
                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm">{bus.startPoint} → {bus.endPoint}</p>
                        {verificationBadge(bus.verificationStatus)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{bus.name} · {bus.type}{bus.isAC ? " · AC" : ""}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform mt-1 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      {/* Details grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        {[
                          { label: "Departure", value: bus.departureTime },
                          { label: "Arrival", value: bus.arrivalTime },
                          { label: "Price", value: `NPR ${bus.price}` },
                          { label: "Seats", value: String(bus.seatCapacity) },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-muted/50 rounded-lg p-2">
                            <p className="text-muted-foreground">{label}</p>
                            <p className="font-medium text-foreground mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>

                      {bus.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {bus.amenities.map((a) => (
                            <span key={a} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-md font-medium">{a}</span>
                          ))}
                        </div>
                      )}

                      {bus.boardingPoints?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Boarding:</span> {bus.boardingPoints.join(", ")}
                        </p>
                      )}

                      {bus.droppingPoints?.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Dropping:</span> {bus.droppingPoints.join(", ")}
                        </p>
                      )}

                      <p className="text-[10px] text-muted-foreground/60">Operator ID: {bus.operatorId}</p>

                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleVerify(bus.id, "approved")}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                            >
                              {actionLoading === bus.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerify(bus.id, "rejected")}
                              disabled={!!actionLoading}
                              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
                            >
                              {actionLoading === bus.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                              Reject
                            </button>
                          </>
                        )}

                        {isApproved && (
                          <button
                            onClick={() => handleHold(bus.id)}
                            disabled={!!actionLoading}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500 text-white text-sm font-semibold hover:bg-yellow-600 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === bus.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PauseCircle className="w-4 h-4" />}
                            Hold
                          </button>
                        )}

                        {isSuspended && (
                          <button
                            onClick={() => handleUnhold(bus.id)}
                            disabled={!!actionLoading}
                            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === bus.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                            Reactivate
                          </button>
                        )}

                        {/* Delete — all non-pending buses */}
                        {!isPending && (
                          isDeleting ? (
                            <div className="flex items-center gap-2 flex-1">
                              <span className="text-xs text-destructive flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Permanently delete this bus?</span>
                              <button
                                onClick={() => handleDelete(bus.id)}
                                disabled={!!actionLoading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                              >
                                {actionLoading === bus.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                                Yes, Delete
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(bus.id)}
                              disabled={!!actionLoading}
                              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
