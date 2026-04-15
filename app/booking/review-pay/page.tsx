// app/booking/review-pay/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/booking-context";
import { useUserAuth } from "@/contexts/user-auth-context";
import { ActiveBookingsService } from "@/components/operator/counter/services/active-booking.service";
import { ArrowLeft, CheckCircle2, ChevronRight, Loader2, AlertTriangle } from "lucide-react";

const service = new ActiveBookingsService();

export default function ReviewPayPage() {
  const router = useRouter();
  const { booking, clearBooking } = useBooking();
  const { userProfile } = useUserAuth();

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);
  const [bookingId, setBookingId] = useState("");

  // Redirect if state is incomplete
  useEffect(() => {
    if (!booking.bus || !booking.seats.length || !booking.passenger.name) {
      router.replace("/");
    }
  }, [booking, router]);

  if (!booking.bus || !booking.seats.length || !booking.passenger.name) return null;

  const { bus, seats, from, to, date, passenger } = booking;
  const total = bus.price * seats.length;

  const fmt12 = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  const duration = (dep: string, arr: string) => {
    const d = new Date(`2024-01-01T${dep}`);
    const a = new Date(`2024-01-01T${arr}`);
    if (a < d) a.setDate(a.getDate() + 1);
    const ms = a.getTime() - d.getTime();
    return `${Math.floor(ms / 3_600_000)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
  };

  const handleConfirm = async () => {
    setError("");
    setLoading(true);
    try {
      // Final availability check
      const available = await service.areSeatAvailable(bus.id, date, seats);
      if (!available) {
        setError("One or more selected seats were just booked by someone else. Please go back and choose different seats.");
        setLoading(false);
        return;
      }

      const result = await service.createActiveBooking({
        operatorId: bus.operatorId || "",
        userId: userProfile?.uid || "",
        busId: bus.id,
        busName: bus.name,
        busType: bus.type,
        from,
        to,
        date,
        time: bus.departureTime,
        seatNumbers: seats,
        passengerName: passenger.name,
        passengerPhone: passenger.phone,
        boardingPoint: passenger.boardingPoint || "",
        droppingPoint: passenger.droppingPoint || "",
        amount: total,
        status: "booked",
        bookingTime: null,
      });

      setBookingId(result.id || "");
      setSuccess(true);
      clearBooking();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-muted/30 pt-16 flex items-center justify-center px-4">
        <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-soft-md">
          <div className="flex justify-center">
            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Booking confirmed!</h1>
          <p className="text-muted-foreground text-sm">
            Your ticket has been booked. Show this at the boarding point.
          </p>

          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-mono font-semibold text-foreground">{bookingId.slice(0, 8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bus</span>
              <span className="font-medium text-foreground">{bus.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route</span>
              <span className="font-medium text-foreground">{from} → {to}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium text-foreground">
                {date ? new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : date}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Seats</span>
              <span className="font-medium text-foreground">{seats.join(", ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount paid</span>
              <span className="font-semibold text-foreground">NPR {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => router.push("/user/bookings")}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all"
            >
              View my bookings
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted/50 transition-all"
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Review screen ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 text-xs font-medium">
          <span className="text-muted-foreground">Seats</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-muted-foreground">Passenger details</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-primary">Review &amp; Pay</span>
        </div>

        <h1 className="text-xl font-bold text-foreground mb-6">Review your booking</h1>

        <div className="space-y-4">

          {/* Journey summary */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Journey</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">{fmt12(bus.departureTime)}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{from}</p>
              </div>
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <span className="text-xs">{duration(bus.departureTime, bus.arrivalTime)}</span>
                <div className="flex items-center gap-1">
                  <div className="w-12 h-px bg-border" />
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <div className="w-12 h-px bg-border" />
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">{fmt12(bus.arrivalTime)}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{to}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{bus.name}</span>
              <span className="text-border">·</span>
              <span>{bus.type}</span>
              {bus.isAC && (
                <>
                  <span className="text-border">·</span>
                  <span>AC</span>
                </>
              )}
              <span className="text-border">·</span>
              <span>
                {date ? new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric" }) : date}
              </span>
            </div>
          </div>

          {/* Seats */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Seats</p>
            <div className="flex flex-wrap gap-2">
              {seats.map((s) => (
                <span key={s} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Passenger */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Passenger</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium text-foreground">{passenger.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium text-foreground">{passenger.phone}</span>
              </div>
              {passenger.boardingPoint && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Boarding point</span>
                  <span className="font-medium text-foreground">{passenger.boardingPoint}</span>
                </div>
              )}
              {passenger.droppingPoint && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dropping point</span>
                  <span className="font-medium text-foreground">{passenger.droppingPoint}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Fare summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>NPR {bus.price.toLocaleString()} × {seats.length} seat{seats.length > 1 ? "s" : ""}</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
                <span>Total</span>
                <span>NPR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Confirm button */}
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming…
              </>
            ) : (
              `Confirm & Pay NPR ${total.toLocaleString()}`
            )}
          </button>

          <p className="text-center text-xs text-muted-foreground pb-2">
            By confirming you agree to the cancellation &amp; refund policy.
          </p>
        </div>
      </div>
    </div>
  );
}
