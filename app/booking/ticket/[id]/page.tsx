"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ActiveBookingsService,
  type IActiveBooking,
} from "@/components/operator/counter/services/active-booking.service";
import {
  CheckCircle2, Printer, Download, Share2, ArrowLeft,
  MessageCircle, Loader2, AlertTriangle, Bus, Copy, Check,
} from "lucide-react";

const service = new ActiveBookingsService();

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt12(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function formatDate(ds: string) {
  const [y, m, d] = ds.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

function formatBookedAt(ts: any) {
  if (!ts) return "N/A";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TicketPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [booking, setBooking] = useState<IActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    service
      .getActiveBookingById(id)
      .then((b) => { if (!b) setError("Booking not found."); else setBooking(b); })
      .catch(() => setError("Failed to load ticket. Please try again."))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleCopyId = () => {
    navigator.clipboard.writeText(booking?.id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => window.print();

  const buildShareText = (b: IActiveBooking) => {
    const seats = b.seatNumbers?.length ? b.seatNumbers : [b.seatNumber].filter(Boolean) as string[];
    return [
      "🚌 UthBus E-Ticket",
      `Bus: ${b.busName} (${b.busType})`,
      `Route: ${b.from} → ${b.to}`,
      `Date: ${formatDate(b.date)}`,
      `Departure: ${fmt12(b.time)}`,
      `Seat(s): ${seats.join(", ")}`,
      `Passenger: ${b.passengerName}`,
      `Booking ID: ${(b.id || "").slice(0, 8).toUpperCase()}`,
    ].join("\n");
  };

  const handleWhatsApp = () => {
    if (!booking) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(buildShareText(booking))}`, "_blank");
  };

  const handleShare = async () => {
    if (!booking) return;
    const text = buildShareText(booking);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "UthBus Ticket", text, url: window.location.href });
        return;
      } catch {}
    }
    await navigator.clipboard.writeText(text);
    alert("Ticket details copied to clipboard!");
  };

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 pt-16">
        <div className="text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-sm">Loading your ticket…</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 pt-16 px-4">
        <div className="bg-card border border-destructive/30 rounded-2xl p-8 max-w-sm w-full text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">{error || "Booking not found"}</h2>
          <Link
            href="/"
            className="inline-block px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const seats = booking.seatNumbers?.length
    ? booking.seatNumbers
    : [booking.seatNumber].filter(Boolean) as string[];

  const shortId = (booking.id || "").slice(0, 8).toUpperCase();

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .ticket-wrapper { padding: 0 !important; max-width: 100% !important; }
          body { background: white !important; }
          header { display: none !important; }
        }
      `}</style>

      <div className="min-h-screen bg-muted/30 pt-16 pb-12">
        <div className="max-w-2xl mx-auto px-4 py-6 ticket-wrapper">

          {/* Back */}
          <button
            onClick={() => router.push("/")}
            className="no-print flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          {/* Confirmation banner */}
          <div className="no-print flex items-center gap-3 mb-5 p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-xl">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 shrink-0" />
            <div>
              <p className="font-semibold text-foreground text-sm">Booking Confirmed!</p>
              <p className="text-xs text-muted-foreground">Show this e-ticket to the conductor at the boarding point</p>
            </div>
          </div>

          {/* ── Ticket card ── */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft-md">

            {/* Ticket header bar */}
            <div className="bg-primary px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bus className="w-5 h-5 text-primary-foreground/70" />
                <span className="text-primary-foreground font-extrabold text-lg tracking-tight">
                  <span className="opacity-75">uth</span>bus
                </span>
                <span className="text-primary-foreground/50 text-xs font-medium hidden sm:inline">· E-Ticket</span>
              </div>
              <div className="text-right">
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest font-medium">Booking ID</p>
                <button
                  onClick={handleCopyId}
                  className="text-primary-foreground font-mono font-bold text-base flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  {shortId}
                  {copied
                    ? <Check className="w-3.5 h-3.5 shrink-0" />
                    : <Copy className="w-3.5 h-3.5 shrink-0 opacity-70" />}
                </button>
              </div>
            </div>

            {/* Route + timing */}
            <div className="px-5 pt-5 pb-4 border-b border-border">
              {/* Bus name */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <p className="font-bold text-foreground text-base leading-tight">{booking.busName}</p>
                <span className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {booking.busType}
                </span>
              </div>

              {/* From → To with departure time */}
              <div className="flex items-center gap-3">
                {/* Departure */}
                <div className="flex-1 min-w-0">
                  <p className="text-2xl font-bold text-foreground tabular-nums">{fmt12(booking.time)}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{booking.from}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(booking.date)}</p>
                </div>

                {/* Arrow line */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="flex items-center gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-10 sm:w-16 h-px bg-border" />
                    <Bus className="w-4 h-4 text-primary" />
                    <div className="w-10 sm:w-16 h-px bg-border" />
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                  </div>
                  <p className="text-[10px] text-muted-foreground">Direct</p>
                </div>

                {/* Destination */}
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-2xl font-bold text-foreground/40 tabular-nums">–</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{booking.to}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(booking.date)}</p>
                </div>
              </div>

              {/* Status + boarding */}
              <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Status: Booked
                  </span>
                </div>
                {booking.boardingPoint && (
                  <p className="text-xs text-muted-foreground">
                    Boarding at <span className="font-semibold text-foreground">{booking.boardingPoint}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Seats pill row */}
            <div className="px-5 py-3 bg-muted/40 border-b border-border flex items-center justify-center gap-3 flex-wrap">
              <span className="text-xs text-muted-foreground">
                {seats.length} Seat{seats.length > 1 ? "s" : ""}
              </span>
              <span className="text-muted-foreground/30">·</span>
              {seats.map((s) => (
                <span key={s} className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {s}
                </span>
              ))}
              <span className="text-muted-foreground/30">·</span>
              <span className="text-xs text-muted-foreground">{booking.busType}</span>
            </div>

            {/* Passenger information */}
            <div className="px-5 py-4 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Passenger Information
              </p>
              <div className="border border-border rounded-xl overflow-hidden">
                {/* Name / phone header row */}
                <div className="bg-muted/30 px-4 py-3 flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-base font-bold text-foreground">{booking.passengerName}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{booking.passengerPhone}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current Status</p>
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">CNF / BOOKED</p>
                  </div>
                </div>

                {/* Detail columns */}
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y divide-border border-t border-border text-xs">
                  {[
                    { label: "Booking Status", value: "CONFIRMED" },
                    { label: "Seat(s)", value: seats.join(", ") },
                    { label: "Boarding", value: booking.boardingPoint || "–" },
                    { label: "Dropping", value: booking.droppingPoint || "–" },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-3 py-2.5">
                      <p className="text-muted-foreground mb-0.5">{label}</p>
                      <p className="font-bold text-foreground break-words">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Booking details + Fare summary — two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 border-b border-border">
              {/* Booking details */}
              <div className="px-5 py-4 sm:border-r border-b sm:border-b-0 border-border">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Booking Details
                </p>
                <dl className="space-y-2 text-sm">
                  {[
                    ["Transaction ID", shortId],
                    ["Ticket Type", "E-Ticket"],
                    ["Booked On", formatBookedAt(booking.bookingTime)],
                    ["Date of Journey", formatDate(booking.date)],
                    ["Departure", fmt12(booking.time)],
                    ["Bus", booking.busName],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-2">
                      <dt className="text-muted-foreground shrink-0">{label}</dt>
                      <dd className="font-medium text-foreground text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Payment / fare details */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Payment Details
                </p>
                <dl className="space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-muted-foreground">Payment Mode</dt>
                    <dd className="font-medium text-foreground">Online (UPI)</dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-muted-foreground">Ticket Fare</dt>
                    <dd className="font-medium text-foreground">
                      NPR {(booking.amount / seats.length).toLocaleString()}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <dt className="text-muted-foreground">No. of Seats</dt>
                    <dd className="font-medium text-foreground">{seats.length}</dd>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex items-start justify-between gap-2">
                    <dt className="font-bold text-foreground">Total Amount</dt>
                    <dd className="font-bold text-foreground text-base">NPR {booking.amount.toLocaleString()}</dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Footer disclaimer */}
            <div className="px-5 py-3 bg-muted/30">
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                This is a valid UthBus e-ticket. Please show this to the conductor/driver at the boarding point.
                Ticket subject to operator's terms and conditions.
              </p>
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="no-print mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              <Printer className="w-4 h-4 shrink-0" />
              Print
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              <Download className="w-4 h-4 shrink-0" />
              Save PDF
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              WhatsApp
            </button>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-muted transition-colors"
            >
              <Share2 className="w-4 h-4 shrink-0" />
              Share
            </button>
          </div>

          <p className="no-print text-center text-xs text-muted-foreground mt-3">
            "Save PDF" opens your browser's print dialog — select "Save as PDF"
          </p>

          {/* View all bookings */}
          <div className="no-print mt-4 text-center">
            <Link
              href="/user/bookings"
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              View all my bookings →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
