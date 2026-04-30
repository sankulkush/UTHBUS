"use client";

import { useState, useCallback } from "react";
import {
  Plus, Pencil, Trash2, ToggleLeft, ToggleRight, X,
  Bus, CheckCircle2, AlertCircle, Wrench, Calendar,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { useCounter } from "../context/counter-context";
import { BusService } from "../services/bus.service";
import type { IBus, BusType, BusStatus } from "../types/counter.types";

const busService = new BusService();

const CITIES = [
  "Kathmandu", "Pokhara", "Chitwan", "Butwal", "Nepalgunj",
  "Dharan", "Biratnagar", "Janakpur", "Birgunj", "Lumbini",
  "Damak", "Itahari", "Kakarvitta",
];

const AMENITIES = ["Wi-Fi", "Charging Point", "Sofa Seat", "TV", "Water Bottle", "CCTV", "Blanket", "Snacks"];

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
  status: "Active",
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

function BusForm({ initial, operatorId, onSave, onCancel, loading }: BusFormProps) {
  const [form, setForm] = useState<Omit<IBus, "id"> & { id?: string }>({
    ...DEFAULT_BUS,
    operatorId,
    ...initial,
  });

  const set = (k: keyof IBus, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const toggleAmenity = (a: string) => {
    set("amenities", form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]);
  };

  const handleBoardingInput = (val: string) => {
    set("boardingPoints", val.split(",").map((s) => s.trim()).filter(Boolean));
  };

  const handleDroppingInput = (val: string) => {
    set("droppingPoints", val.split(",").map((s) => s.trim()).filter(Boolean));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl w-full max-w-xl my-4 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-semibold text-foreground">{form.id ? "Edit Bus" : "Add New Bus"}</h2>
          <button onClick={onCancel} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Basic info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Bus Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Pokhara Express"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type *</label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value as BusType)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {["Micro", "Deluxe", "AC Deluxe"].map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Seat Capacity *</label>
              <input
                type="number" min="1"
                value={form.seatCapacity}
                onChange={(e) => set("seatCapacity", Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Model</label>
              <input
                value={form.model}
                onChange={(e) => set("model", e.target.value)}
                placeholder="e.g. Coaster"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status *</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as BusStatus)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                {["Active", "Maintenance", "Inactive"].map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* AC toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("isAC", !form.isAC)}
              className={`w-10 h-6 rounded-full transition-colors ${form.isAC ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow mx-1 transition-transform ${form.isAC ? "translate-x-4" : "translate-x-0"}`} />
            </button>
            <span className="text-sm text-foreground">Air-Conditioned (AC)</span>
          </div>

          {/* Route */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">From (Origin) *</label>
              <select
                required
                value={form.startPoint}
                onChange={(e) => set("startPoint", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">To (Destination) *</label>
              <select
                required
                value={form.endPoint}
                onChange={(e) => set("endPoint", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                <option value="">Select city</option>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Timing & Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Departure *</label>
              <input
                type="time" required
                value={form.departureTime}
                onChange={(e) => set("departureTime", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Arrival *</label>
              <input
                type="time" required
                value={form.arrivalTime}
                onChange={(e) => set("arrivalTime", e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (NPR) *</label>
              <input
                type="number" min="1" required
                value={form.price}
                onChange={(e) => set("price", Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
          </div>

          {/* Boarding/Dropping points */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Boarding Points (comma-separated)</label>
              <input
                value={form.boardingPoints.join(", ")}
                onChange={(e) => handleBoardingInput(e.target.value)}
                placeholder="New Bus Park, Kalanki, Balkhu"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Dropping Points (comma-separated)</label>
              <input
                value={form.droppingPoints.join(", ")}
                onChange={(e) => handleDroppingInput(e.target.value)}
                placeholder="Pokhara Bus Park, Lakeside, Prithvi Chowk"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    form.amenities.includes(a)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Saving…" : form.id ? "Update Bus" : "Add Bus"}
            </button>
          </div>
        </form>
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
    const next: BusStatus = bus.status === "Active" ? "Inactive" : "Active";
    try {
      await busService.updateBus(bus.id, { status: next });
      await refreshData();
    } catch (e) {
      console.error(e);
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
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Bus className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{bus.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(bus.status)}`}>
                        {statusIcon(bus.status)} {bus.status}
                      </span>
                      {bus.isAC && <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded text-[10px] font-semibold">AC</span>}
                      <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">{bus.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => setAvailabilityBus(bus)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Manage availability"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => { setEditingBus(bus); setShowForm(true); }}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(bus.id)}
                    disabled={deletingId === bus.id}
                    className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Route & timing */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-muted-foreground">Route</p>
                  <p className="font-medium text-foreground mt-0.5 truncate">{bus.startPoint} → {bus.endPoint}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-muted-foreground">Timing</p>
                  <p className="font-medium text-foreground mt-0.5">{bus.departureTime} – {bus.arrivalTime}</p>
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

              {/* Unavailable dates warning */}
              {(bus.unavailableDates?.length ?? 0) > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg px-2.5 py-1.5">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span>{bus.unavailableDates!.length} unavailable date{bus.unavailableDates!.length > 1 ? "s" : ""}</span>
                </div>
              )}

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
    </div>
  );
}
