// app/booking/review-pay/page.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/booking-context";
import { useUserAuth } from "@/contexts/user-auth-context";
import { ActiveBookingsService } from "@/components/operator/counter/services/active-booking.service";
import { ArrowLeft, ChevronRight, Loader2, AlertTriangle, Tag, Check, X as XIcon } from "lucide-react";

// Single hard-coded promo rule per spec: WELCOME50 → flat NPR 50 off.
function evaluatePromo(code: string, subtotal: number): { discount: number; valid: boolean } {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { discount: 0, valid: false };
  if (normalized === "WELCOME50") {
    // Don't let the discount exceed the subtotal
    return { discount: Math.min(50, subtotal), valid: true };
  }
  return { discount: 0, valid: false };
}

const service = new ActiveBookingsService();

export default function ReviewPayPage() {
  const router = useRouter();
  const { booking, hydrated, clearBooking } = useBooking();
  const { userProfile } = useUserAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ code: string; discount: number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const confirmedRef = useRef(false);

  // Redirect if booking state is incomplete (skip after successful confirmation).
  // Wait for sessionStorage hydration first so a guest returning from sign-in
  // doesn't get bounced before restore.
  useEffect(() => {
    if (confirmedRef.current) return;
    if (!hydrated) return;
    if (!booking.bus || !booking.seats.length || !booking.passenger.name) {
      router.replace("/");
    }
  }, [booking, hydrated, router]);

  if (!hydrated || !booking.bus || !booking.seats.length || !booking.passenger.name) return null;

  const { bus, seats, from, to, date, passenger } = booking;
  const subtotal = bus.price * seats.length;
  const discount = promoApplied?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const handleApplyPromo = () => {
    setPromoError("");
    const { discount: d, valid } = evaluatePromo(promoCode, subtotal);
    if (!valid) {
      setPromoApplied(null);
      setPromoError("That promo code isn't valid. You can still continue with your booking.");
      return;
    }
    setPromoApplied({ code: promoCode.trim().toUpperCase(), discount: d });
  };

  const handleRemovePromo = () => {
    setPromoApplied(null);
    setPromoCode("");
    setPromoError("");
  };

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

  const formatDisplayDate = (ds: string) => {
    const [y, m, d] = ds.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short", month: "long", day: "numeric",
    });
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

      confirmedRef.current = true;
      clearBooking();
      router.push(`/booking/ticket/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed. Please try again.");
      setLoading(false);
    }
  };

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
              <span>{date ? formatDisplayDate(date) : date}</span>
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

          {/* Promo code */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Promo code <span className="text-muted-foreground/60 normal-case tracking-normal">(optional)</span></p>
            </div>

            {promoApplied ? (
              <div className="flex items-center justify-between gap-3 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {promoApplied.code} applied
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400">
                      You saved NPR {promoApplied.discount.toLocaleString()} on this booking
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="shrink-0 text-xs font-medium text-muted-foreground hover:text-destructive flex items-center gap-1 px-2 py-1 rounded-md hover:bg-destructive/10 transition-colors"
                >
                  <XIcon className="w-3 h-3" /> Remove
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) => { setPromoCode(e.target.value); setPromoError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleApplyPromo(); } }}
                    placeholder="Enter code (e.g. WELCOME50)"
                    className="flex-1 px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground placeholder:text-muted-foreground/70 uppercase tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={!promoCode.trim()}
                    className="px-4 py-2.5 rounded-lg bg-foreground text-background text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    Apply
                  </button>
                </div>
                {promoError && (
                  <p className="text-xs text-destructive mt-2">{promoError}</p>
                )}
              </>
            )}
          </div>

          {/* Price */}
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Fare summary</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>NPR {bus.price.toLocaleString()} × {seats.length} seat{seats.length > 1 ? "s" : ""}</span>
                <span>NPR {subtotal.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Promo discount ({promoApplied?.code})</span>
                  <span>− NPR {discount.toLocaleString()}</span>
                </div>
              )}
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
