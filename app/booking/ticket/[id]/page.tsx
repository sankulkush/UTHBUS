"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ActiveBookingsService,
  type IActiveBooking,
} from "@/components/operator/counter/services/active-booking.service";
import { PayNowModal } from "@/components/booking/PayNowModal";
import {
  CheckCircle2, Printer, Download, Share2, ArrowLeft,
  MessageCircle, Loader2, AlertTriangle, Bus, Copy, Check,
  Clock, CreditCard, Receipt, Wallet,
} from "lucide-react";

// ── Payment display helpers ──────────────────────────────────────────────────

/** Mask a transaction id for ticket display. Keeps the first 6 and last 4
 *  characters with an ellipsis in the middle so the user can still match
 *  against their gateway receipt without printing a 30-char string. */
function maskTxnId(txnId: string): string {
  if (txnId.length <= 12) return txnId;
  return `${txnId.slice(0, 6)}…${txnId.slice(-4)}`;
}

function formatPaidAt(ts: any): string {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("en-US", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

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
    navigator.clipboard.writeText(booking?.pnr || booking?.id || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => window.print();

  const buildShareText = (b: IActiveBooking) => {
    const seats = b.seatNumbers?.length ? b.seatNumbers : [b.seatNumber].filter(Boolean) as string[];
    return [
      "🚌 UthBus E-Ticket",
      `PNR: ${b.pnr || "—"}`,
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
        <div className="max-w-5xl mx-auto px-4 py-6 ticket-wrapper">

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

          {/* Two-column layout: ticket on left, actions on right (stacks on mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-5 items-start">

          {/* ── Ticket card ── */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft-md">

            {/* Ticket header bar */}
            <div className="bg-primary px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Bus className="w-5 h-5 text-primary-foreground/70 shrink-0" />
                <span className="text-primary-foreground font-extrabold text-lg tracking-tight">
                  <span className="opacity-75">uth</span>bus
                </span>
                <span className="text-primary-foreground/50 text-xs font-medium hidden sm:inline">· E-Ticket</span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest font-medium">PNR</p>
                <button
                  onClick={handleCopyId}
                  title="Copy PNR"
                  className="text-primary-foreground font-mono font-extrabold text-lg tracking-wider flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                >
                  {booking.pnr || shortId}
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
                    ["PNR", booking.pnr || "—"],
                    ["Booking ID", shortId],
                    ["Ticket Type", "E-Ticket"],
                    ["Booked On", formatBookedAt(booking.bookingTime)],
                    ["Date of Journey", formatDate(booking.date)],
                    ["Departure", fmt12(booking.time)],
                    ["Bus", booking.busName],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-2">
                      <dt className="text-muted-foreground shrink-0">{label}</dt>
                      <dd className={`text-right ${label === "PNR" ? "font-mono font-bold text-foreground tracking-wider" : "font-medium text-foreground"}`}>
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Payment / fare details — renders by paymentStatus.
                  Sprint 1: data foundation. Sprint 3 (eSewa) populates the
                  paid/pending_gateway branches; cancellation flow populates
                  refunded. */}
              <div className="px-5 py-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  Payment Details
                </p>

                <PaymentBlock booking={booking} seats={seats} />
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

          {/* ── Vertical Action Panel (right column on desktop, stacked below on mobile) ── */}
          <aside className="no-print lg:sticky lg:top-20">
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-soft">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Ticket Actions
                </p>
              </div>
              <div className="p-3 flex flex-col gap-2">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted hover:border-foreground/20 transition-colors"
                >
                  <Printer className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-left">Print</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted hover:border-foreground/20 transition-colors"
                >
                  <Download className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-left">Save PDF</span>
                </button>
                <button
                  onClick={handleWhatsApp}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span className="flex-1 text-left">WhatsApp</span>
                </button>
                <button
                  onClick={handleShare}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium hover:bg-muted hover:border-foreground/20 transition-colors"
                >
                  <Share2 className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 text-left">Share</span>
                </button>
              </div>
              <div className="px-4 py-3 border-t border-border bg-muted/20">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  "Save PDF" opens the browser print dialog — choose "Save as PDF" as the destination.
                </p>
              </div>
            </div>

            {/* View all bookings */}
            <div className="mt-3 text-center lg:text-left">
              <Link
                href="/user/bookings"
                className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
              >
                View all my bookings →
              </Link>
            </div>
          </aside>

          </div>
        </div>
      </div>
    </>
  );
}

// ── PaymentBlock ─────────────────────────────────────────────────────────────
// Renders the payment summary on the e-ticket. Branches on booking.paymentStatus:
//   - paid                    → green "Paid via <mode>" banner + masked txn id
//   - unpaid_pending_counter  → amber "Pay at counter" banner with amount due
//   - pending_gateway         → blue "Payment in progress" banner + retry CTA
//   - failed                  → red "Payment failed" banner + retry CTA
//   - refunded                → gray "Refunded" banner
// Pre-Sprint-1 bookings (no paymentStatus field) fall through to the safest
// default — Reserved/pay-at-counter — so old tickets keep rendering.
function PaymentBlock({
  booking,
  seats,
}: {
  booking: IActiveBooking;
  seats: string[];
}) {
  const [payNowOpen, setPayNowOpen] = useState(false);
  const fare = (booking.amount / Math.max(seats.length, 1));
  const total = booking.amount;
  const status = booking.paymentStatus ?? "unpaid_pending_counter";
  const mode = booking.paymentMode;
  const txnId = booking.paymentTxnId;
  const paidAt = booking.paidAt;

  // Standalone "Pay Now" button used by the three unpaid variants.
  // Opens the PayNowModal stub (Sprint 3 will replace its disabled gateway
  // buttons with real handlers).
  const PayNowButton = ({ tone }: { tone: "amber" | "blue" | "red" }) => {
    const toneClasses =
      tone === "blue"
        ? "border-blue-300 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        : tone === "red"
        ? "border-red-300 bg-red-600 text-white hover:bg-red-700"
        : "border-amber-300 bg-amber-600 text-white hover:bg-amber-700";
    return (
      <button
        type="button"
        onClick={() => setPayNowOpen(true)}
        className={`no-print mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${toneClasses}`}
      >
        <CreditCard className="w-3.5 h-3.5" /> Pay Now
      </button>
    );
  };

  const FareRows = (
    <dl className="space-y-2 text-sm mt-4">
      <div className="flex items-start justify-between gap-2">
        <dt className="text-muted-foreground">Ticket Fare</dt>
        <dd className="font-medium text-foreground">NPR {fare.toLocaleString()}</dd>
      </div>
      <div className="flex items-start justify-between gap-2">
        <dt className="text-muted-foreground">No. of Seats</dt>
        <dd className="font-medium text-foreground">{seats.length}</dd>
      </div>
      <div className="h-px bg-border my-1" />
      <div className="flex items-start justify-between gap-2">
        <dt className="font-bold text-foreground">Total Amount</dt>
        <dd className="font-bold text-foreground text-base">NPR {total.toLocaleString()}</dd>
      </div>
    </dl>
  );

  if (status === "paid") {
    return (
      <div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
              Paid {mode ? `via ${mode}` : ""}
            </span>
          </div>
          <dl className="text-xs space-y-1">
            {txnId && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-emerald-700/70 dark:text-emerald-400/70">Transaction ID</dt>
                <dd className="font-mono font-medium text-emerald-900 dark:text-emerald-200">
                  {maskTxnId(txnId)}
                </dd>
              </div>
            )}
            {paidAt && (
              <div className="flex items-start justify-between gap-2">
                <dt className="text-emerald-700/70 dark:text-emerald-400/70">Paid on</dt>
                <dd className="font-medium text-emerald-900 dark:text-emerald-200">
                  {formatPaidAt(paidAt)}
                </dd>
              </div>
            )}
          </dl>
        </div>
        {FareRows}
      </div>
    );
  }

  if (status === "pending_gateway") {
    return (
      <div>
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900/40 dark:bg-blue-950/30">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-pulse" />
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              Payment in progress
            </span>
          </div>
          <p className="text-xs text-blue-800/80 dark:text-blue-200/80 mt-1 leading-relaxed">
            We're waiting for {mode || "the payment gateway"} to confirm your payment.
            This usually takes under a minute. Don't pay again until you've checked here.
          </p>
          <PayNowButton tone="blue" />
        </div>
        {FareRows}
        <PayNowModal isOpen={payNowOpen} onClose={() => setPayNowOpen(false)} booking={booking} />
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div>
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/40 dark:bg-red-950/30">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span className="text-sm font-bold text-red-700 dark:text-red-300">
              Payment failed
            </span>
          </div>
          <p className="text-xs text-red-800/80 dark:text-red-200/80 mt-1 leading-relaxed">
            Your {mode || "gateway"} payment didn't go through. Your seat is still held —
            you can retry the payment or pay at the counter at boarding time.
          </p>
          <PayNowButton tone="red" />
        </div>
        {FareRows}
        <PayNowModal isOpen={payNowOpen} onClose={() => setPayNowOpen(false)} booking={booking} />
      </div>
    );
  }

  if (status === "refunded") {
    return (
      <div>
        <div className="rounded-lg border border-muted bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-bold text-foreground">Refunded</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            This booking has been cancelled and the refund processed
            {mode ? ` back to your ${mode} account` : ""}. Allow 3–5 business days
            for the funds to appear.
          </p>
        </div>
        {FareRows}
      </div>
    );
  }

  // Default: unpaid_pending_counter (also catches legacy bookings with no
  // paymentStatus field, which fall back to ?? above).
  return (
    <div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
        <div className="flex items-center gap-2 mb-1">
          <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-bold text-amber-800 dark:text-amber-200">
            Reserved — pay at counter
          </span>
        </div>
        <p className="text-xs text-amber-900/80 dark:text-amber-200/80 mt-1 leading-relaxed">
          Your seat is held. Please bring this ticket and pay
          <span className="font-bold"> NPR {total.toLocaleString()}</span> in cash to the
          operator at the boarding point — or pay online now.
        </p>
        <PayNowButton tone="amber" />
      </div>
      {FareRows}
      <PayNowModal isOpen={payNowOpen} onClose={() => setPayNowOpen(false)} booking={booking} />
    </div>
  );
}
