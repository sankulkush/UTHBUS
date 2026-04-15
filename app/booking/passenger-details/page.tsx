// app/booking/passenger-details/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "@/contexts/booking-context";
import { useUserAuth } from "@/contexts/user-auth-context";
import { ArrowLeft, User, Phone, MapPin, ChevronRight } from "lucide-react";

export default function PassengerDetailsPage() {
  const router = useRouter();
  const { booking, setPassengerDetails } = useBooking();
  const { userProfile } = useUserAuth();

  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [boarding, setBoarding]   = useState("");
  const [dropping, setDropping]   = useState("");
  const [errors, setErrors]       = useState<Record<string, string>>({});

  // Redirect if no bus selected
  useEffect(() => {
    if (!booking.bus) router.replace("/");
  }, [booking.bus, router]);

  // Auto-fill logged-in user data
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.fullName || "");
      setPhone(userProfile.phoneNumber || "");
    }
  }, [userProfile]);

  if (!booking.bus) return null;

  const { bus, seats, from, to, date } = booking;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Passenger name is required";
    if (!phone.trim()) e.phone = "Phone number is required";
    else if (!/^(\+?977)?[0-9]{10}$/.test(phone.replace(/\s/g, "")))
      e.phone = "Enter a valid Nepal phone number";
    return e;
  };

  const handleContinue = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setPassengerDetails({ name, phone, boardingPoint: boarding, droppingPoint: dropping });
    router.push("/booking/review-pay");
  };

  const fmt12 = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to results
        </button>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8 text-xs font-medium">
          <span className="text-muted-foreground">Seats</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-primary">Passenger details</span>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-muted-foreground">Review &amp; Pay</span>
        </div>

        {/* Trip summary chip */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{bus.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {from} → {to} · {date ? new Date(date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : ""}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-medium text-foreground">{fmt12(bus.departureTime)}</p>
            <div className="flex items-center gap-1.5 mt-1 justify-end flex-wrap">
              {seats.map((s) => (
                <span key={s} className="text-[11px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h1 className="text-lg font-semibold text-foreground">Passenger details</h1>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full name <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                placeholder="Enter full name"
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${errors.name ? "border-destructive" : "border-border"}`}
              />
            </div>
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone number <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                placeholder="98XXXXXXXX"
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${errors.phone ? "border-destructive" : "border-border"}`}
              />
            </div>
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>

          {/* Boarding point */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Boarding point <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              {bus.boardingPoints?.length > 0 ? (
                <select
                  value={boarding}
                  onChange={(e) => setBoarding(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors appearance-none"
                >
                  <option value="">Select boarding point</option>
                  {bus.boardingPoints.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={boarding}
                  onChange={(e) => setBoarding(e.target.value)}
                  placeholder="e.g. New Bus Park, Ratnapark"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                />
              )}
            </div>
          </div>

          {/* Dropping point */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Dropping point <span className="text-muted-foreground text-xs font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              {bus.droppingPoints?.length > 0 ? (
                <select
                  value={dropping}
                  onChange={(e) => setDropping(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors appearance-none"
                >
                  <option value="">Select dropping point</option>
                  {bus.droppingPoints.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={dropping}
                  onChange={(e) => setDropping(e.target.value)}
                  placeholder="e.g. Damak Chowk, College Road"
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors"
                />
              )}
            </div>
          </div>

          {/* Continue */}
          <button
            onClick={handleContinue}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all mt-2"
          >
            Continue to review
          </button>
        </div>
      </div>
    </div>
  );
}
