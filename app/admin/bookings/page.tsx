"use client"
import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAdminAuth } from "@/contexts/admin-auth-context"
import { ActiveBookingsService } from "@/components/operator/counter/services/active-booking.service"
import type { IActiveBooking } from "@/components/operator/counter/services/active-booking.service"
import {
  LogOut, RefreshCw, Loader2, Bus, BookOpen, Search, X,
  User, Phone, MapPin, Calendar, Clock, Banknote,
  CheckCircle2, XCircle, AlertTriangle, ChevronDown, Filter,
} from "lucide-react"

const bookingService = new ActiveBookingsService()

type StatusFilter = "all" | "booked" | "cancelled" | "completed"

function statusBadge(s: string) {
  if (s === "booked")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"><CheckCircle2 className="w-3 h-3" /> Booked</span>
  if (s === "cancelled")
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"><XCircle className="w-3 h-3" /> Cancelled</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"><CheckCircle2 className="w-3 h-3" /> Completed</span>
}

function formatDate(ts: any): string {
  if (!ts) return "—"
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  } catch {
    return "—"
  }
}

export default function AdminBookingsPage() {
  const { admin, loading: authLoading, logout } = useAdminAuth()
  const router = useRouter()

  const [bookings, setBookings] = useState<IActiveBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmCancel, setConfirmCancel] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")

  useEffect(() => {
    if (!authLoading && !admin) router.replace("/admin/login")
  }, [admin, authLoading, router])

  const fetchBookings = useCallback(async () => {
    setLoading(true)
    try {
      const all = await bookingService.getAllBookingsForAdmin()
      setBookings(all)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (admin) fetchBookings() }, [admin, fetchBookings])

  const handleCancel = async (bookingId: string) => {
    setActionLoading(bookingId)
    try {
      await bookingService.cancelActiveBooking(bookingId)
      setConfirmCancel(null)
      setExpandedId(null)
      await fetchBookings()
    } finally {
      setActionLoading(null)
    }
  }

  const filteredBookings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false
      if (!q) return true
      return (
        b.passengerName?.toLowerCase().includes(q) ||
        b.passengerPhone?.toLowerCase().includes(q) ||
        b.busName?.toLowerCase().includes(q) ||
        b.from?.toLowerCase().includes(q) ||
        b.to?.toLowerCase().includes(q) ||
        b.id?.toLowerCase().includes(q) ||
        b.operatorId?.toLowerCase().includes(q)
      )
    })
  }, [bookings, searchQuery, statusFilter])

  const counts = {
    all: bookings.length,
    booked: bookings.filter((b) => b.status === "booked").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  }

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
  }
  if (!admin) return null

  const statuses: { key: StatusFilter; label: string }[] = [
    { key: "all", label: `All (${counts.all})` },
    { key: "booked", label: `Booked (${counts.booked})` },
    { key: "completed", label: `Completed (${counts.completed})` },
    { key: "cancelled", label: `Cancelled (${counts.cancelled})` },
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
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 text-primary">
                <BookOpen className="w-3.5 h-3.5" /> Bookings
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
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
          <span className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-primary border-b-2 border-primary">
            <BookOpen className="w-3.5 h-3.5" /> Bookings
          </span>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-lg font-bold text-foreground">All Bookings</h1>
            <p className="text-sm text-muted-foreground">Platform-wide bookings across all operators and passengers.</p>
          </div>
          {/* Stats summary */}
          <div className="flex gap-2 flex-wrap">
            {[
              { label: "Total", value: counts.all, color: "text-foreground" },
              { label: "Active", value: counts.booked, color: "text-green-600 dark:text-green-400" },
              { label: "Completed", value: counts.completed, color: "text-blue-600 dark:text-blue-400" },
              { label: "Cancelled", value: counts.cancelled, color: "text-red-600 dark:text-red-400" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-card border border-border rounded-xl px-3 py-2 text-center min-w-[60px]">
                <p className={`text-lg font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search + filter row */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by passenger, phone, bus, route…"
              className="w-full pl-9 pr-9 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-xl overflow-x-auto">
            {statuses.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${statusFilter === key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              {searchQuery ? "No bookings match your search" : "No bookings found"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredBookings.map((booking) => {
              const isExpanded = expandedId === booking.id
              const isCancelling = confirmCancel === booking.id
              const canCancel = booking.status === "booked"
              return (
                <div key={booking.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : booking.id!)}
                  >
                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground text-sm truncate">{booking.passengerName}</p>
                        {statusBadge(booking.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {booking.from} → {booking.to} · {booking.date} · {booking.busName ?? "Bus"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-foreground">NPR {booking.amount}</p>
                      <p className="text-[10px] text-muted-foreground">{(booking.seatNumbers ?? [booking.seatNumber]).filter(Boolean).join(", ")}</p>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform mt-1 ${isExpanded ? "rotate-180" : ""}`} />
                  </div>

                  {isExpanded && (
                    <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                        {[
                          { icon: <User className="w-3 h-3" />, label: "Passenger", value: booking.passengerName },
                          { icon: <Phone className="w-3 h-3" />, label: "Phone", value: booking.passengerPhone },
                          { icon: <Bus className="w-3 h-3" />, label: "Bus", value: `${booking.busName ?? "—"} (${booking.busType ?? "—"})` },
                          { icon: <MapPin className="w-3 h-3" />, label: "Route", value: `${booking.from} → ${booking.to}` },
                          { icon: <Calendar className="w-3 h-3" />, label: "Travel Date", value: booking.date },
                          { icon: <Clock className="w-3 h-3" />, label: "Departure", value: booking.time },
                          { icon: <MapPin className="w-3 h-3" />, label: "Boarding", value: booking.boardingPoint || "—" },
                          { icon: <MapPin className="w-3 h-3" />, label: "Dropping", value: booking.droppingPoint || "—" },
                          { icon: <Banknote className="w-3 h-3" />, label: "Amount", value: `NPR ${booking.amount}` },
                        ].map(({ icon, label, value }) => (
                          <div key={label} className="bg-muted/50 rounded-lg p-2">
                            <div className="flex items-center gap-1 text-muted-foreground mb-0.5">{icon}<span>{label}</span></div>
                            <p className="font-medium text-foreground truncate">{value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Seats: <span className="text-foreground font-medium">{(booking.seatNumbers ?? [booking.seatNumber]).filter(Boolean).join(", ")}</span></span>
                        <span className="mx-1">·</span>
                        <span>Booked at: <span className="text-foreground font-medium">{formatDate(booking.bookingTime)}</span></span>
                        <span className="mx-1">·</span>
                        <span className="truncate">Operator: <span className="text-foreground font-medium">{booking.operatorId}</span></span>
                      </div>
                      <p className="text-[10px] text-muted-foreground/60">Booking ID: {booking.id}</p>

                      {canCancel && (
                        isCancelling ? (
                          <div className="flex items-center gap-3 pt-1 flex-wrap">
                            <span className="text-xs text-destructive flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5" /> Cancel this booking?
                            </span>
                            <button
                              onClick={() => handleCancel(booking.id!)}
                              disabled={!!actionLoading}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                            >
                              {actionLoading === booking.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                              Yes, Cancel
                            </button>
                            <button
                              onClick={() => setConfirmCancel(null)}
                              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-muted hover:bg-muted/80"
                            >
                              Keep
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setConfirmCancel(booking.id!) }}
                            disabled={!!actionLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-destructive/40 text-destructive text-sm font-semibold hover:bg-destructive/10 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" /> Cancel Booking
                          </button>
                        )
                      )}
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
