"use client";

import { useMemo, useState } from "react";
import { Map, Bus, Clock, DollarSign, ArrowRight, Pencil, X, Save } from "lucide-react";
import { useCounter } from "../context/counter-context";
import { BusService } from "../services/bus.service";
import type { IBus } from "../types/counter.types";

const busService = new BusService();

function fmt12(t?: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

interface EditRouteModalProps {
  bus: IBus;
  onClose: () => void;
  onSave: (id: string, updates: Partial<IBus>) => Promise<void>;
  loading: boolean;
}

function EditRouteModal({ bus, onClose, onSave, loading }: EditRouteModalProps) {
  const [form, setForm] = useState({
    departureTime: bus.departureTime,
    arrivalTime: bus.arrivalTime,
    price: bus.price,
    boardingPoints: bus.boardingPoints.join(", "),
    droppingPoints: bus.droppingPoints.join(", "),
  });

  const handleSave = () => {
    onSave(bus.id, {
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      price: Number(form.price),
      boardingPoints: form.boardingPoints.split(",").map((s) => s.trim()).filter(Boolean),
      droppingPoints: form.droppingPoints.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-semibold text-foreground text-sm">Edit Route Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{bus.name} · {bus.startPoint} → {bus.endPoint}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Departure Time</label>
              <input type="time" value={form.departureTime} onChange={(e) => setForm((p) => ({ ...p, departureTime: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Arrival Time</label>
              <input type="time" value={form.arrivalTime} onChange={(e) => setForm((p) => ({ ...p, arrivalTime: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (NPR)</label>
            <input type="number" min="1" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Boarding Points (comma-separated)</label>
            <input value={form.boardingPoints} onChange={(e) => setForm((p) => ({ ...p, boardingPoints: e.target.value }))}
              placeholder="New Bus Park, Kalanki, Balkhu"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Dropping Points (comma-separated)</label>
            <input value={form.droppingPoints} onChange={(e) => setForm((p) => ({ ...p, droppingPoints: e.target.value }))}
              placeholder="Pokhara Bus Park, Lakeside"
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted">Cancel</button>
            <button onClick={handleSave} disabled={loading} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              <Save className="w-3.5 h-3.5" />{loading ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RoutesPage() {
  const { buses, refreshData } = useCounter();
  const [editingBus, setEditingBus] = useState<IBus | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Group buses by route pair
  const routes = useMemo(() => {
    const groups: Record<string, IBus[]> = {};
    buses.forEach((b) => {
      const key = `${b.startPoint}||${b.endPoint}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(b);
    });
    return Object.entries(groups).map(([key, buslist]) => {
      const [from, to] = key.split("||");
      return { from, to, buses: buslist };
    });
  }, [buses]);

  const handleSave = async (id: string, updates: Partial<IBus>) => {
    setSaveLoading(true);
    try {
      await busService.updateBus(id, updates);
      await refreshData();
      setEditingBus(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <p className="text-xs text-muted-foreground">
        Routes are derived from your buses. Edit timing, price, and stop points per bus below.
      </p>

      {routes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Map className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground text-sm">No routes yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Add buses with origin and destination to see routes here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((routeItem) => { const { from, to, buses: routeBuses } = routeItem; return (
            <div key={`${from}-${to}`} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Route header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-muted/30">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Map className="w-4 h-4 text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">{from}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground text-sm">{to}</span>
                </div>
                <span className="ml-auto text-xs text-muted-foreground">{routeBuses.length} bus{routeBuses.length > 1 ? "es" : ""}</span>
              </div>

              {/* Bus list for route */}
              <div className="divide-y divide-border">
                {routeBuses.map((bus) => (
                  <div key={bus.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Bus className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <p className="text-sm font-medium text-foreground truncate">{bus.name}</p>
                        <span className="text-[10px] text-muted-foreground">({bus.type}{bus.isAC ? " · AC" : ""})</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {fmt12(bus.departureTime)} – {fmt12(bus.arrivalTime)}</span>
                        <span className="flex items-center gap-1 font-semibold text-foreground">NPR {bus.price.toLocaleString()}</span>
                        {bus.boardingPoints.length > 0 && <span>{bus.boardingPoints.length} boarding pts</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingBus(bus)}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ); })}
        </div>
      )}

      {editingBus && (
        <EditRouteModal
          bus={editingBus}
          onClose={() => setEditingBus(null)}
          onSave={handleSave}
          loading={saveLoading}
        />
      )}
    </div>
  );
}
