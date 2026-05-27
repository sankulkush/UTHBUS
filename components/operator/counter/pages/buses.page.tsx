"use client";

import { useState } from "react";
import {
  Plus, Pencil, Trash2, X,
  Bus, CheckCircle2, AlertCircle, Wrench, Calendar,
  MapPin, Clock, Tag, Settings2, Hash, Ban,
} from "lucide-react";
import { useCounter } from "../context/counter-context";
import { BusService } from "../services/bus.service";
import { ActiveBookingsService } from "../services/active-booking.service";
import { SeatMapNAEditor } from "../components/seat-map";
import type { IBus, BusType, BusStatus } from "../types/counter.types";
import CitySelect from "@/components/city-select";

const busService = new BusService();
const bookingsService = new ActiveBookingsService();

const AMENITIES = ["Wi-Fi", "Charging Point", "Sofa Seat", "TV", "Water Bottle", "CCTV", "Blanket", "Snacks"];

const BUS_TYPES: BusType[] = ["Micro", "Hiace", "Deluxe", "AC Deluxe"];

const DEFAULT_BUS: Omit<IBus, "id"> = {
  operatorId: "",
  name: "",
  type: "Deluxe",
  model: "",
  isAC: false,
  amenities: [],
  routes: [],
  startPoint: "",
  endPoint: "",
  boardingPoints: [],
  droppingPoints: [],
  photos: [],
  status: "Inactive", // createBus() will set pending_verification; operator cannot self-activate new buses
  departureTime: "06:00",
  arrivalTime: "12:00",
  duration: "6h",
  price: 500,
  seatCapacity: 32,
  unavailableDates: [],
};

function statusIcon(s: BusStatus) {
  if (s === "Active") return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
  if (s === "Maintenance") return <Wrench className="w-3.5 h-3.5 text-yellow-500" />;
  return <AlertCircle className="w-3.5 h-3.5 text-red-500" />;
}

function statusBadge(s: BusStatus) {
  if (s === "Active") return "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400";
  if (s === "Maintenance") return "bg-yellow-50 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400";
  return "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400";
}

interface BusFormProps {
  initial: Partial<IBus>;
  operatorId: string;
  onSave: (bus: Omit<IBus, "id"> & { id?: string }) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

// Section header for the multi-section form
function SectionHeader({ icon: Icon, title, hint }: { icon: React.ElementType; title: string; hint?: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground leading-none">{title}</h3>
        {hint && <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  );
}

// Chip-input that parses values on Enter / comma — preserves the in-progress
// raw input so trailing punctuation doesn't get eaten while the user types.
function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const tokens = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (!tokens.length) return;
    const next = [...values];
    for (const t of tokens) if (!next.includes(t)) next.push(t);
    onChange(next);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (draft.trim()) commit(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (draft.trim()) commit(draft);
  };

  const remove = (v: string) => onChange(values.filter((x) => x !== v));

  return (
    <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-2 bg-background border border-border rounded-lg focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/60 transition-all min-h-[42px]">
      {values.map((v) => (
        <span
          key={v}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium"
        >
          {v}
          <button
            type="button"
            onClick={() => remove(v)}
            className="hover:bg-primary/20 rounded p-0.5 -mr-0.5"
            tabIndex={-1}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => {
          const v = e.target.value;
          // If the user pasted/typed a comma, commit immediately
          if (v.includes(",")) commit(v);
          else setDraft(v);
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={values.length ? "" : placeholder}
        className="flex-1 min-w-[100px] outline-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70"
      />
    </div>
  );
}

function BusForm({ initial, operatorId, onSave, onCancel, loading }: BusFormProps) {
  const [form, setForm] = useState<Omit<IBus, "id"> & { id?: string }>({
    ...DEFAULT_BUS,
    operatorId,
    ...initial,
  });
  const [error, setError] = useState("");

  const set = (k: keyof IBus, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const toggleAmenity = (a: string) => {
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.startPoint) return setError("Please choose an origin city.");
    if (!form.endPoint) return setError("Please choose a destination city.");
    if (form.startPoint === form.endPoint) return setError("Origin and destination must be different.");
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-2xl my-2 sm:my-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Bus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground text-base leading-none">
                {form.id ? "Edit Bus" : "Add New Bus"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {form.id ? "Update fleet details" : "Register a new bus into your fleet"}
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 sm:px-6 py-5 space-y-6">
          {/* ── Identity ── */}
          <section>
            <SectionHeader icon={Tag} title="Identity" hint="Name & classification" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bus Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Pokhara Express"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value as BusType)}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                >
                  {BUS_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Model</label>
                <input
                  value={form.model}
                  onChange={(e) => set("model", e.target.value)}
                  placeholder="e.g. Coaster"
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                />
              </div>
            </div>
          </section>

          {/* ── Configuration ── */}
          <section>
            <SectionHeader icon={Settings2} title="Configuration" hint="Capacity, status, AC" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block flex items-center gap-1">
                  <Hash className="w-3 h-3" /> Seat Capacity *
                </label>
                <input
                  type="number" min="1" required
                  value={form.seatCapacity}
                  onChange={(e) => set("seatCapacity", Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                />
              </div>
              {/* Status only editable on existing buses — new buses start pending_verification */}
              {form.id && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => set("status", e.target.value as BusStatus)}
                    className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                  >
                    {["Active", "Maintenance", "Inactive"].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              {!form.id && (
                <div className="flex items-center px-3 py-2.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-lg text-xs text-orange-700 dark:text-orange-400">
                  New buses require UthBus admin approval before going live.
                </div>
              )}
            </div>
            <label className="flex items-center gap-3 mt-3 px-3 py-2.5 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors">
              <button
                type="button"
                onClick={() => set("isAC", !form.isAC)}
                className={`w-10 h-6 rounded-full transition-colors shrink-0 ${form.isAC ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${form.isAC ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className="text-sm text-foreground flex-1">Air-Conditioned (AC)</span>
              {form.isAC && <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Enabled</span>}
            </label>
          </section>

          {/* ── Route ── */}
          <section>
            <SectionHeader icon={MapPin} title="Route" hint="Origin and destination cities" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">From (Origin) *</label>
                <CitySelect
                  value={form.startPoint}
                  onChange={(v) => set("startPoint", v)}
                  placeholder="Search origin city"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">To (Destination) *</label>
                <CitySelect
                  value={form.endPoint}
                  onChange={(v) => set("endPoint", v)}
                  placeholder="Search destination city"
                />
              </div>
            </div>
          </section>

          {/* ── Schedule & Pricing ── */}
          <section>
            <SectionHeader icon={Clock} title="Schedule & Pricing" hint="Departure, arrival, fare" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Departure *</label>
                <input
                  type="time" required
                  value={form.departureTime}
                  onChange={(e) => set("departureTime", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Arrival *</label>
                <input
                  type="time" required
                  value={form.arrivalTime}
                  onChange={(e) => set("arrivalTime", e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Price (NPR) *</label>
                <input
                  type="number" min="1" required
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 text-foreground transition-all"
                />
              </div>
            </div>
          </section>

          {/* ── Boarding/Dropping points ── */}
          <section>
            <SectionHeader
              icon={MapPin}
              title="Stops"
              hint="Press Enter or comma to add each stop"
            />
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Boarding Points</label>
                <ChipInput
                  values={form.boardingPoints}
                  onChange={(v) => set("boardingPoints", v)}
                  placeholder="e.g. New Bus Park, Kalanki, Balkhu"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Dropping Points</label>
                <ChipInput
                  values={form.droppingPoints}
                  onChange={(v) => set("droppingPoints", v)}
                  placeholder="e.g. Pokhara Bus Park, Lakeside, Prithvi Chowk"
                />
              </div>
            </div>
          </section>

          {/* ── Amenities ── */}
          <section>
            <SectionHeader icon={CheckCircle2} title="Amenities" hint="Select what the bus offers" />
            <div className="flex flex-wrap gap-1.5">
              {AMENITIES.map((a) => {
                const active = form.amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      active
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-border -mx-5 sm:-mx-6 px-5 sm:px-6 pt-5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[1.2] py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Saving…" : form.id ? "Update Bus" : "Add Bus"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Confirmation dialog shown before deactivating a bus that has active bookings
function DeactivateConfirmDialog({
  bus,
  activeBookingCount,
  onConfirm,
  onCancel,
  loading,
}: {
  bus: IBus;
  activeBookingCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-start gap-3 p-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-foreground text-sm leading-tight">Deactivate Bus?</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {activeBookingCount > 0 ? (
                <>
                  <span className="font-semibold text-destructive">{activeBookingCount} active booking{activeBookingCount > 1 ? "s" : ""}</span>{" "}
                  will be cancelled and affected passengers will need to rebook.
                </>
              ) : (
                "This bus will be hidden from passenger search immediately."
              )}
            </p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-muted/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{bus.startPoint} → {bus.endPoint}</span>
            {" · "}{bus.name}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-[1.2] py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? "Deactivating…" : "Yes, Deactivate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// N/A seat manager — lets operators block individual seats on a bus
function NASeatModal({
  bus,
  onClose,
  onSave,
}: {
  bus: IBus;
  onClose: () => void;
  onSave: (naSeats: string[]) => void;
}) {
  const [naSeats, setNaSeats] = useState<string[]>(bus.naSeats ?? []);
  const [bookedSeats] = useState<string[]>([]); // bookings loaded async below
  const [bookedWarning, setBookedWarning] = useState<string | null>(null);

  const handleToggleNA = (seat: string, isCurrentlyBooked: boolean) => {
    if (isCurrentlyBooked && !naSeats.includes(seat)) {
      setBookedWarning(
        `Seat ${seat} has an active booking. Marking it N/A won't cancel that booking — the passenger will still travel. Are you sure?`
      );
      // We store the seat to mark after user acknowledges
      return;
    }
    setBookedWarning(null);
    setNaSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md my-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground text-sm">Manage N/A Seats</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {bus.startPoint} → {bus.endPoint} · {bus.name}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Click any seat to toggle it as <strong className="text-foreground">N/A</strong> (blocked). N/A seats cannot be booked by passengers. Yellow seats have active bookings.
          </p>

          {bookedWarning && (
            <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-3 text-xs text-yellow-800 dark:text-yellow-300">
              {bookedWarning}
            </div>
          )}

          <div className="flex justify-center overflow-x-auto">
            <SeatMapNAEditor
              bus={bus}
              booked={bookedSeats}
              naSeats={naSeats}
              onToggleNA={handleToggleNA}
            />
          </div>

          {naSeats.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {naSeats.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium border border-dashed border-slate-400 dark:border-slate-600">
                  {s}
                  <button type="button" onClick={() => setNaSeats((prev) => prev.filter((x) => x !== s))} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancel
            </button>
            <button onClick={() => onSave(naSeats)} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
              Save N/A Seats
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Availability date manager
function AvailabilityModal({ bus, onClose, onSave }: { bus: IBus; onClose: () => void; onSave: (dates: string[]) => void }) {
  const [dates, setDates] = useState<string[]>(bus.unavailableDates || []);
  const [input, setInput] = useState("");

  const addDate = () => {
    if (input && !dates.includes(input)) {
      setDates([...dates, input].sort());
    }
    setInput("");
  };

  const removeDate = (d: string) => setDates(dates.filter((x) => x !== d));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground text-sm">Bus Availability</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{bus.name}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-muted-foreground">Add dates when this bus does <strong className="text-foreground">not</strong> run. It will be hidden from passenger search on those dates.</p>
          <div className="flex gap-2">
            <input
              type="date"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
            />
            <button onClick={addDate} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90">
              Add
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {dates.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No unavailable dates — bus runs every day</p>
            ) : (
              dates.map((d) => (
                <div key={d} className="flex items-center justify-between px-3 py-2 bg-muted rounded-lg">
                  <span className="text-sm text-foreground">{d}</span>
                  <button onClick={() => removeDate(d)} className="text-muted-foreground hover:text-destructive">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancel
            </button>
            <button onClick={() => onSave(dates)} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusesPage() {
  const { buses, operator, refreshData } = useCounter();
  const [showForm, setShowForm] = useState(false);
  const [editingBus, setEditingBus] = useState<IBus | null>(null);
  const [availabilityBus, setAvailabilityBus] = useState<IBus | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Deactivation confirmation state
  const [deactivateBus, setDeactivateBus] = useState<IBus | null>(null);
  const [deactivateBookingCount, setDeactivateBookingCount] = useState(0);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  // N/A seat management state
  const [naSeatBus, setNaSeatBus] = useState<IBus | null>(null);

  const handleSave = async (data: Omit<IBus, "id"> & { id?: string }) => {
    if (!operator) return;
    setFormLoading(true);
    try {
      if (data.id) {
        const { id, ...updates } = data;
        await busService.updateBus(id, updates);
      } else {
        await busService.createBus({ ...data, operatorId: operator.uid });
      }
      await refreshData();
      setShowForm(false);
      setEditingBus(null);
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this bus? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await busService.deleteBus(id);
      await refreshData();
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (bus: IBus) => {
    if (bus.status === "Active") {
      // Going Active → Inactive: check for active bookings and show confirmation
      try {
        const active = await bookingsService.getBookingsForBus(bus.id);
        setDeactivateBookingCount(active.length);
        setDeactivateBus(bus);
      } catch (e) {
        console.error(e);
      }
    } else {
      // Going Inactive/Maintenance → Active: no confirmation needed
      try {
        await busService.updateBus(bus.id, { status: "Active" });
        await refreshData();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!deactivateBus) return;
    setDeactivateLoading(true);
    try {
      // Cancel all active bookings for this bus
      const active = await bookingsService.getBookingsForBus(deactivateBus.id);
      await Promise.all(active.map((b) => bookingsService.cancelActiveBooking(b.id!)));
      // Mark bus inactive
      await busService.updateBus(deactivateBus.id, { status: "Inactive" });
      await refreshData();
      setDeactivateBus(null);
    } catch (e) {
      console.error(e);
    } finally {
      setDeactivateLoading(false);
    }
  };

  const handleSaveAvailability = async (dates: string[]) => {
    if (!availabilityBus) return;
    try {
      await busService.updateBus(availabilityBus.id, { unavailableDates: dates });
      await refreshData();
      setAvailabilityBus(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNASeats = async (naSeats: string[]) => {
    if (!naSeatBus) return;
    try {
      await busService.updateBus(naSeatBus.id, { naSeats });
      await refreshData();
      setNaSeatBus(null);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{buses.length} bus{buses.length !== 1 ? "es" : ""} registered</p>
        </div>
        <button
          onClick={() => { setEditingBus(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Bus
        </button>
      </div>

      {/* Bus list */}
      {buses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bus className="w-12 h-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground">No buses yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Add your first bus to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {buses.map((bus) => (
            <div key={bus.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              {/* Bus header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{bus.startPoint} → {bus.endPoint}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{bus.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(bus.status)}`}>
                        {statusIcon(bus.status)} {bus.status}
                      </span>
                      {bus.isAC && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded text-[10px] font-semibold">AC</span>}
                      <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">{bus.type}</span>
                      {bus.verificationStatus === "pending_verification" && (
                        <span className="px-1.5 py-0.5 bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded text-[10px] font-semibold border border-orange-200 dark:border-orange-800">
                          Awaiting Approval
                        </span>
                      )}
                      {bus.verificationStatus === "rejected" && (
                        <span className="px-1.5 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded text-[10px] font-semibold border border-red-200 dark:border-red-800">
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setAvailabilityBus(bus)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Manage availability dates"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setNaSeatBus(bus)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Manage N/A seats"
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingBus(bus); setShowForm(true); }}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Edit bus"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(bus.id)}
                    disabled={deletingId === bus.id}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"
                    title="Delete bus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Timing & pricing */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-muted-foreground">Timing</p>
                  <p className="font-medium text-foreground mt-0.5">{bus.departureTime} – {bus.arrivalTime}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium text-foreground mt-0.5 truncate">{bus.duration || "—"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-muted-foreground">Price / Seats</p>
                  <p className="font-medium text-foreground mt-0.5">NPR {bus.price} · {bus.seatCapacity}</p>
                </div>
              </div>

              {/* Boarding/dropping */}
              {(bus.boardingPoints.length > 0 || bus.droppingPoints.length > 0) && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {bus.boardingPoints.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">Boarding</p>
                      <div className="flex flex-wrap gap-1">
                        {bus.boardingPoints.map((p) => (
                          <span key={p} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {bus.droppingPoints.length > 0 && (
                    <div>
                      <p className="text-muted-foreground mb-1">Dropping</p>
                      <div className="flex flex-wrap gap-1">
                        {bus.droppingPoints.map((p) => (
                          <span key={p} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Unavailable dates & N/A seat indicators */}
              <div className="flex flex-wrap gap-1.5">
                {(bus.unavailableDates?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg px-2.5 py-1.5">
                    <Calendar className="w-3 h-3 shrink-0" />
                    <span>{bus.unavailableDates!.length} unavailable date{bus.unavailableDates!.length > 1 ? "s" : ""}</span>
                  </div>
                )}
                {(bus.naSeats?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg px-2.5 py-1.5">
                    <Ban className="w-3 h-3 shrink-0" />
                    <span>{bus.naSeats!.length} seat{bus.naSeats!.length > 1 ? "s" : ""} N/A</span>
                  </div>
                )}
              </div>

              {/* Status toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-border">
                <span className="text-xs text-muted-foreground">Active in search</span>
                <button
                  onClick={() => handleToggleStatus(bus)}
                  className={`w-10 h-6 rounded-full transition-colors ${bus.status === "Active" ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${bus.status === "Active" ? "translate-x-4" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showForm || editingBus) && operator && (
        <BusForm
          initial={editingBus ?? {}}
          operatorId={operator.uid}
          onSave={handleSave}
          onCancel={() => { setShowForm(false); setEditingBus(null); }}
          loading={formLoading}
        />
      )}

      {availabilityBus && (
        <AvailabilityModal
          bus={availabilityBus}
          onClose={() => setAvailabilityBus(null)}
          onSave={handleSaveAvailability}
        />
      )}

      {deactivateBus && (
        <DeactivateConfirmDialog
          bus={deactivateBus}
          activeBookingCount={deactivateBookingCount}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setDeactivateBus(null)}
          loading={deactivateLoading}
        />
      )}

      {naSeatBus && (
        <NASeatModal
          bus={naSeatBus}
          onClose={() => setNaSeatBus(null)}
          onSave={handleSaveNASeats}
        />
      )}
    </div>
  );
}
