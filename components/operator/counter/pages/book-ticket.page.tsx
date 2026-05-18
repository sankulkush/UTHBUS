"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Ticket, Search, CheckCircle2, ArrowRight, Bus,
  User, Phone, MapPin, RefreshCw, Printer, PlusCircle,
  AlertCircle, Calendar, X,
} from "lucide-react";
import { useCounter } from "../context/counter-context";
import { BookingService } from "../services/booking.service";
import { ActiveBookingsService } from "../services/active-booking.service";
import { SeatMapPicker } from "../components/seat-map";
import type { IBus } from "../types/counter.types";
import type { IActiveBooking } from "../context/counter-context";

const bookingService = new BookingService();
const seatService = new ActiveBookingsService();

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmt12(t?: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function calcDuration(dep: string, arr: string) {
  const [dh, dm] = dep.split(":").map(Number);
  const [ah, am] = arr.split(":").map(Number);
  let mins = (ah * 60 + am) - (dh * 60 + dm);
  if (mins < 0) mins += 24 * 60;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

// ── Step indicator ────────────────────────────────────────────────────────────
function Steps({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Select Bus", "Passenger & Seat", "Confirm"];
  return (
    <div className="flex items-center mb-6">
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${done ? "bg-green-500 text-white" : active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="w-4 h-4" /> : n}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${active ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${done ? "bg-green-500" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Bus list row ──────────────────────────────────────────────────────────────
function BusRow({ bus, onClick }: { bus: IBus; onClick: () => void }) {
  const dur = bus.duration || calcDuration(bus.departureTime, bus.arrivalTime);
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-xl p-4 hover:border-primary/60 hover:bg-primary/[0.02] hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Bus className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate group-hover:text-primary transition-colors">
              {bus.name}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{bus.type}</span>
              {bus.isAC && (
                <span className="text-[10px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-1.5 py-0.5 rounded">AC</span>
              )}
            </div>
          </div>
        </div>
        <p className="text-lg font-black text-primary shrink-0">NPR {bus.price.toLocaleString()}</p>
      </div>

      {/* Route + times */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-xs font-medium text-foreground">{bus.startPoint}</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
        <span className="text-xs font-medium text-foreground">{bus.endPoint}</span>
        <span className="text-[10px] text-muted-foreground ml-1">({dur})</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{fmt12(bus.departureTime)}</span>
        <span>→</span>
        <span className="font-medium text-foreground">{fmt12(bus.arrivalTime)}</span>
        <span className="ml-auto">{bus.seatCapacity} seats</span>
      </div>
    </button>
  );
}

// ── Success ticket ────────────────────────────────────────────────────────────
function SuccessTicket({ ticket, onNew }: { ticket: IActiveBooking; onNew: () => void }) {
  const seatsList = ticket.seatNumbers?.length
    ? ticket.seatNumbers
    : ticket.seatNumber
    ? [ticket.seatNumber]
    : [];
  const seatsLabel = seatsList.join(", ") || "—";
  return (
    <div className="space-y-4">
      <div className="bg-green-500 rounded-2xl p-5 text-center text-white">
        <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
        <h2 className="text-lg font-bold">Ticket Booked!</h2>
        <p className="text-sm text-white/80 mt-0.5">Counter booking confirmed</p>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="bg-primary/10 border-b border-border px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Ticket className="w-4 h-4 text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">PNR</p>
              <p className="font-mono font-extrabold text-base text-foreground tracking-wider mt-0.5 leading-none">
                {ticket.pnr || "—"}
              </p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider leading-none">Booking ID</p>
            <p className="font-mono text-[11px] text-muted-foreground mt-0.5 leading-none">{ticket.id?.slice(-8)}</p>
          </div>
        </div>

        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">{fmt12(ticket.time)}</p>
            <p className="text-sm text-muted-foreground mt-0.5">{ticket.from}</p>
          </div>
          <div className="flex flex-col items-center gap-1 text-muted-foreground">
            <ArrowRight className="w-5 h-5" />
            <span className="text-xs">{ticket.busName}</span>
          </div>
          <div className="text-center">
            <p className="text-2xl font-black text-foreground">—</p>
            <p className="text-sm text-muted-foreground mt-0.5">{ticket.to}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-0 divide-x divide-y divide-border">
          {[
            { label: "Passenger", value: ticket.passengerName },
            { label: "Phone", value: ticket.passengerPhone },
            { label: "Date", value: ticket.date },
            { label: seatsList.length > 1 ? "Seats" : "Seat", value: seatsLabel, bold: true },
            { label: "Bus Type", value: ticket.busType },
            { label: "Amount", value: `NPR ${ticket.amount?.toLocaleString()}`, bold: true },
            ...(ticket.boardingPoint ? [{ label: "Boarding", value: ticket.boardingPoint }] : []),
            ...(ticket.droppingPoint ? [{ label: "Dropping", value: ticket.droppingPoint }] : []),
          ].map(({ label, value, bold }) => (
            <div key={label} className="px-4 py-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className={`text-sm mt-0.5 ${bold ? "font-bold text-primary" : "font-medium text-foreground"}`}>{value}</p>
            </div>
          ))}
        </div>

        <div className="bg-green-50 dark:bg-green-950/30 px-5 py-2.5 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400">CONFIRMED · Counter Booking</span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <Printer className="w-4 h-4" /> Print
        </button>
        <button
          onClick={onNew}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> New Booking
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function BookTicketPage() {
  const { operator, buses, refreshData } = useCounter();

  const [query, setQuery] = useState("");
  const [date, setDate] = useState(localToday());
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [bookedTicket, setBookedTicket] = useState<IActiveBooking | null>(null);

  const totalAmount = (selectedBus?.price ?? 0) * selectedSeats.length;

  const toggleSeat = (label: string) => {
    setSelectedSeats((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const step: 1 | 2 | 3 = bookedTicket ? 3 : selectedBus ? 2 : 1;

  // Filter operator's active buses by query (name or route)
  const filteredBuses = useMemo(() => {
    const active = buses.filter((b) => b.status === "Active" && !b.unavailableDates?.includes(date));
    if (!query.trim()) return active;
    const q = query.toLowerCase();
    return active.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.startPoint.toLowerCase().includes(q) ||
        b.endPoint.toLowerCase().includes(q) ||
        `${b.startPoint} ${b.endPoint}`.toLowerCase().includes(q)
    );
  }, [buses, query, date]);

  // Fetch booked seats when bus or date changes
  useEffect(() => {
    if (!selectedBus) return;
    setSeatsLoading(true);
    seatService
      .getBookedSeats(selectedBus.id, date)
      .then(setBookedSeats)
      .catch(() => setBookedSeats([]))
      .finally(() => setSeatsLoading(false));
  }, [selectedBus, date]);

  const handleSelectBus = (bus: IBus) => {
    setSelectedBus(bus);
    setSelectedSeats([]);
    setBoardingPoint("");
    setDroppingPoint("");
    setSubmitError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus || !operator) return;
    if (!passengerName.trim() || !passengerPhone.trim()) {
      setSubmitError("Passenger name and phone are required.");
      return;
    }
    if (selectedSeats.length === 0) { setSubmitError("Please select at least one seat."); return; }
    const conflict = selectedSeats.find((s) => bookedSeats.includes(s));
    if (conflict) {
      setSubmitError(`Seat ${conflict} is already booked. Please choose another.`);
      return;
    }

    setSubmitError("");
    setSubmitLoading(true);
    try {
      // Go through the service so a PNR is generated + uniqueness-checked.
      const created = await seatService.createActiveBooking({
        operatorId: operator.uid,
        busId: selectedBus.id,
        busName: selectedBus.name,
        busType: selectedBus.type,
        from: selectedBus.startPoint,
        to: selectedBus.endPoint,
        date,
        time: selectedBus.departureTime,
        // seatNumber kept for legacy/back-compat (first seat)
        seatNumber: selectedSeats[0],
        seatNumbers: selectedSeats,
        passengerName: passengerName.trim(),
        passengerPhone: passengerPhone.trim(),
        boardingPoint: boardingPoint || "",
        droppingPoint: droppingPoint || "",
        amount: selectedBus.price * selectedSeats.length,
        bookingTime: null,
        status: "booked",
      });

      // Mirror to legacy `bookings` collection — one record per seat
      await Promise.all(
        selectedSeats.map((seat) =>
          bookingService.createBooking({
            busId: selectedBus.id,
            operatorId: operator.uid,
            passengerName: passengerName.trim(),
            passengerPhone: passengerPhone.trim(),
            from: selectedBus.startPoint,
            to: selectedBus.endPoint,
            date,
            time: selectedBus.departureTime,
            seatNumber: seat,
            amount: selectedBus.price,
            status: "Confirmed",
            boardingPoint: boardingPoint || "",
            droppingPoint: droppingPoint || "",
            busName: selectedBus.name,
            busType: selectedBus.type,
          })
        )
      );

      setBookedTicket({ ...created, bookingTime: new Date() });
      // Refresh the FULL dashboard data (buses + bookings + dashboardStats)
      // so today's count and revenue cards reflect this booking immediately.
      await refreshData();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Booking failed. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = () => {
    setQuery(""); setDate(localToday());
    setSelectedBus(null); setBookedSeats([]);
    setPassengerName(""); setPassengerPhone(""); setSelectedSeats([]);
    setBoardingPoint(""); setDroppingPoint("");
    setSubmitError(""); setBookedTicket(null);
  };

  // ── Success screen ────────────────────────────────────────────────────────
  if (bookedTicket) {
    return (
      <div className="p-4 md:p-6 max-w-lg mx-auto">
        <Steps step={3} />
        <SuccessTicket ticket={bookedTicket} onNew={handleReset} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <Steps step={step} />

      {/* ── Step 1: Bus selection ─────────────────────────────────── */}
      {!selectedBus && (
        <div className="space-y-3">
          {/* Search + date bar */}
          <div className="bg-card border border-border rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Find a Bus</p>
            <div className="flex gap-2">
              {/* Universal search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by bus name or route…"
                  className="w-full pl-8 pr-8 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Date */}
              <div className="relative shrink-0">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-8 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Bus list */}
          {filteredBuses.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <Bus className="w-9 h-9 text-muted-foreground/25 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                {buses.filter((b) => b.status === "Active").length === 0
                  ? "No active buses found"
                  : "No buses match your search"}
              </p>
              {query && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try searching by bus name like "Yatri" or route like "Kathmandu Pokhara"
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground px-0.5">
                {filteredBuses.length} bus{filteredBuses.length !== 1 ? "es" : ""} available
                {query && <> matching "<span className="font-medium text-foreground">{query}</span>"</>}
              </p>
              {filteredBuses.map((bus) => (
                <BusRow key={bus.id} bus={bus} onClick={() => handleSelectBus(bus)} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Step 2: Passenger details + seat ─────────────────────── */}
      {selectedBus && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selected bus banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <Bus className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{selectedBus.name}</p>
              <p className="text-xs text-muted-foreground">
                {selectedBus.startPoint} → {selectedBus.endPoint} · {fmt12(selectedBus.departureTime)} · NPR {selectedBus.price.toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Date picker inline for selected bus */}
              <div className="relative hidden sm:block">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setSelectedSeats([]); }}
                  className="pl-7 pr-2 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
              </div>
              <button
                type="button"
                onClick={() => setSelectedBus(null)}
                className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-muted transition-all"
              >
                Change
              </button>
            </div>
          </div>

          {/* Mobile date picker */}
          <div className="sm:hidden">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Travel Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setSelectedSeats([]); }}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
          </div>

          {/* Passenger info */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Passenger Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    required
                    value={passengerName}
                    onChange={(e) => setPassengerName(e.target.value)}
                    placeholder="Passenger full name"
                    className="w-full pl-8 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    required
                    type="tel"
                    value={passengerPhone}
                    onChange={(e) => setPassengerPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full pl-8 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Boarding / Dropping */}
            {(selectedBus.boardingPoints?.length > 0 || selectedBus.droppingPoints?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedBus.boardingPoints?.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Boarding Point</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <select
                        value={boardingPoint}
                        onChange={(e) => setBoardingPoint(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground appearance-none"
                      >
                        <option value="">Not specified</option>
                        {selectedBus.boardingPoints.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                {selectedBus.droppingPoints?.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Dropping Point</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <select
                        value={droppingPoint}
                        onChange={(e) => setDroppingPoint(e.target.value)}
                        className="w-full pl-8 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground appearance-none"
                      >
                        <option value="">Not specified</option>
                        {selectedBus.droppingPoints.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seat map */}
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Select Seat{selectedSeats.length > 1 ? "s" : ""} *
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-0.5">
                  Tap a seat to add or remove. Multiple seats are allowed.
                </p>
              </div>
              {selectedSeats.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedSeats.map((s) => (
                    <span
                      key={s}
                      className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {seatsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-4 h-4 text-muted-foreground animate-spin" />
              </div>
            ) : (
              <div className="flex justify-center">
                <SeatMapPicker
                  bus={selectedBus}
                  booked={bookedSeats}
                  selected={selectedSeats}
                  onToggle={toggleSeat}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {submitError && (
            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />{submitError}
            </div>
          )}

          {/* Fare + submit */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">
                Total fare {selectedSeats.length > 0 && (
                  <span className="text-muted-foreground/70">
                    · NPR {selectedBus.price.toLocaleString()} × {selectedSeats.length}
                  </span>
                )}
              </p>
              <p className="text-2xl font-black text-foreground">
                NPR {totalAmount.toLocaleString()}
              </p>
            </div>
            <button
              type="submit"
              disabled={submitLoading || selectedSeats.length === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {submitLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Ticket className="w-4 h-4" />}
              {submitLoading ? "Booking…" : `Confirm ${selectedSeats.length || ""} Booking${selectedSeats.length > 1 ? "s" : ""}`.trim()}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
