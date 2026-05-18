"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search, Filter, RefreshCw, CheckCircle2, XCircle,
  Clock, Users, ChevronDown, Eye, X, AlertTriangle,
} from "lucide-react";
import { useCounter } from "../context/counter-context";
import { ActiveBookingsService } from "../services/active-booking.service";
import type { IActiveBooking } from "../context/counter-context";

const service = new ActiveBookingsService();

type StatusFilter = "all" | "booked" | "completed" | "cancelled";

function statusBadge(status: string) {
  switch (status) {
    case "booked":    return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
    case "completed": return "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400";
    case "cancelled": return "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400";
    default:          return "bg-muted text-muted-foreground";
  }
}

function fmt12(t?: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtDate(ds: string) {
  if (!ds) return "—";
  const [y, m, d] = ds.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface DetailModalProps {
  booking: IActiveBooking;
  onClose: () => void;
  onAction: (id: string, status: "cancelled" | "completed") => void;
  onRequestCancel: () => void;
  loading: boolean;
}

function DetailModal({ booking, onClose, onAction, onRequestCancel, loading }: DetailModalProps) {
  const seats = booking.seatNumbers?.join(", ") || booking.seatNumber || "—";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">Booking Details</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {/* PNR pill */}
          <div className="flex items-center justify-between gap-3 bg-primary/10 border border-primary/30 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest">PNR</p>
              <p className="font-mono font-extrabold text-base text-foreground tracking-wider mt-0.5">{booking.pnr || "—"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Booking ID</p>
              <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{booking.id?.slice(0, 8) || "—"}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Passenger", value: booking.passengerName },
              { label: "Phone", value: booking.passengerPhone },
              { label: "Bus", value: booking.busName },
              { label: "Seats", value: seats },
              { label: "Route", value: `${booking.from} → ${booking.to}` },
              { label: "Date", value: booking.date },
              { label: "Departure", value: fmt12(booking.time) },
              { label: "Amount", value: `NPR ${booking.amount?.toLocaleString()}` },
              { label: "Boarding", value: booking.boardingPoint || "—" },
              { label: "Dropping", value: booking.droppingPoint || "—" },
              { label: "Type", value: booking.userId ? "Online" : "Counter" },
              { label: "Status", value: booking.status },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="font-medium text-foreground capitalize">{value}</p>
              </div>
            ))}
          </div>

          {booking.status === "booked" && (
            <div className="flex gap-2 pt-2">
              <button
                disabled={loading}
                onClick={() => onAction(booking.id!, "completed")}
                className="flex-1 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                Mark Completed
              </button>
              <button
                disabled={loading}
                onClick={onRequestCancel}
                className="flex-1 py-2 rounded-lg border border-destructive text-destructive text-sm font-semibold hover:bg-destructive/10 disabled:opacity-50 transition-colors"
              >
                Cancel Booking
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface CancelConfirmDialogProps {
  booking: IActiveBooking;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function CancelConfirmDialog({ booking, loading, onClose, onConfirm }: CancelConfirmDialogProps) {
  const seats = booking.seatNumbers?.join(", ") || booking.seatNumber || "—";
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 pt-5 pb-4 text-center">
          <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-foreground text-base">Cancel this booking?</h3>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
            This will mark <span className="font-semibold text-foreground">{booking.passengerName}</span>'s
            booking on <span className="font-semibold text-foreground">{booking.busName}</span> (seat {seats})
            as cancelled and free those seats. <span className="font-semibold text-destructive">This action cannot be undone.</span>
          </p>
        </div>

        <div className="px-5 py-3 bg-muted/40 border-t border-border space-y-2 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Route</span><span className="font-medium text-foreground">{booking.from} → {booking.to}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium text-foreground">{fmtDate(booking.date)} · {fmt12(booking.time)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Refund amount</span><span className="font-bold text-foreground">NPR {booking.amount?.toLocaleString()}</span></div>
        </div>

        <div className="flex gap-2 p-4 border-t border-border">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
          >
            Keep Booking
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? "Cancelling…" : "Yes, Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BookingsPage() {
  const { activeBookings, refreshActiveBookings, operator } = useCounter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<IActiveBooking | null>(null);
  const [cancelTarget, setCancelTarget] = useState<IActiveBooking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshActiveBookings();
    setRefreshing(false);
  };

  const handleAction = async (id: string, status: "cancelled" | "completed") => {
    setActionLoading(true);
    try {
      await service.updateActiveBooking(id, { status });
      await refreshActiveBookings();
      setSelectedBooking(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget?.id) return;
    setActionLoading(true);
    try {
      await service.updateActiveBooking(cancelTarget.id, { status: "cancelled" });
      await refreshActiveBookings();
      setCancelTarget(null);
      setSelectedBooking(null);
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let list = [...activeBookings];
    if (statusFilter !== "all") list = list.filter((b) => b.status === statusFilter);
    if (dateFilter) list = list.filter((b) => b.date === dateFilter);
    if (search.trim()) {
      const s = search.toLowerCase();
      list = list.filter(
        (b) =>
          b.pnr?.toLowerCase().includes(s) ||
          b.passengerName.toLowerCase().includes(s) ||
          b.passengerPhone?.includes(s) ||
          b.id?.toLowerCase().includes(s) ||
          b.busName?.toLowerCase().includes(s)
      );
    }
    return list;
  }, [activeBookings, statusFilter, dateFilter, search]);

  const counts = useMemo(() => ({
    all: activeBookings.length,
    booked: activeBookings.filter((b) => b.status === "booked").length,
    completed: activeBookings.filter((b) => b.status === "completed").length,
    cancelled: activeBookings.filter((b) => b.status === "cancelled").length,
  }), [activeBookings]);

  const tabs: { id: StatusFilter; label: string }[] = [
    { id: "all", label: `All (${counts.all})` },
    { id: "booked", label: `Active (${counts.booked})` },
    { id: "completed", label: `Completed (${counts.completed})` },
    { id: "cancelled", label: `Cancelled (${counts.cancelled})` },
  ];

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Status tabs */}
      <div className="flex items-center gap-1 border border-border bg-card rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setStatusFilter(t.id)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2 pl-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by PNR, name, phone, bus..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="sm:w-40 px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
        />
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted"
          >
            Clear date
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        Showing {filtered.length} booking{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table / Cards */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Users className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No bookings found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  {["PNR", "Passenger", "Bus / Route", "Date", "Seats", "Amount", "Type", "Status", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((b) => {
                  const seats = b.seatNumbers?.join(", ") || b.seatNumber || "—";
                  return (
                    <tr
                      key={b.id}
                      onClick={() => setSelectedBooking(b)}
                      className="hover:bg-muted/40 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-foreground tracking-wider text-xs">
                          {b.pnr || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{b.passengerName}</p>
                        <p className="text-xs text-muted-foreground">{b.passengerPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground">{b.busName}</p>
                        <p className="text-xs text-muted-foreground">{b.from} → {b.to}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        <p>{fmtDate(b.date)}</p>
                        <p>{fmt12(b.time)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-muted rounded-md text-xs font-mono">{seats}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        NPR {b.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${b.userId ? "bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400" : "bg-muted text-muted-foreground"}`}>
                          {b.userId ? "Online" : "Counter"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusBadge(b.status)}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Eye className="w-3.5 h-3.5 text-muted-foreground inline-block" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {filtered.map((b) => {
              const seats = b.seatNumbers?.join(", ") || b.seatNumber || "—";
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="inline-block font-mono font-bold text-foreground text-xs tracking-wider bg-muted px-2 py-0.5 rounded mb-1">
                        {b.pnr || "—"}
                      </span>
                      <p className="font-semibold text-foreground text-sm truncate">{b.passengerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.busName} · {b.from} → {b.to}</p>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${statusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>Seat {seats}</span>
                    <span>·</span>
                    <span>{fmtDate(b.date)}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">NPR {b.amount?.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {selectedBooking && (
        <DetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onAction={handleAction}
          onRequestCancel={() => setCancelTarget(selectedBooking)}
          loading={actionLoading}
        />
      )}

      {cancelTarget && (
        <CancelConfirmDialog
          booking={cancelTarget}
          loading={actionLoading}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleConfirmCancel}
        />
      )}
    </div>
  );
}
