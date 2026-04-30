"use client";

import { useState, useEffect, useMemo } from "react";
import { Grid3x3, Calendar, Bus, RefreshCw } from "lucide-react";
import { useCounter } from "../context/counter-context";
import { ActiveBookingsService } from "../services/active-booking.service";
import type { IBus } from "../types/counter.types";

const service = new ActiveBookingsService();

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function SeatGrid({ capacity, booked }: { capacity: number; booked: string[] }) {
  const seats = Array.from({ length: capacity }, (_, i) => String(i + 1));
  const cols = capacity <= 20 ? 5 : 4;

  return (
    <div className={`grid gap-1.5`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {seats.map((s) => {
        const isBooked = booked.includes(s);
        return (
          <div
            key={s}
            className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold transition-colors ${
              isBooked
                ? "bg-red-500 text-white"
                : "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
            }`}
          >
            {s}
          </div>
        );
      })}
    </div>
  );
}

export function SeatsPage() {
  const { buses } = useCounter();
  const [selectedBusId, setSelectedBusId] = useState<string>("");
  const [date, setDate] = useState(todayStr());
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const activeBuses = useMemo(() => buses.filter((b) => b.status === "Active"), [buses]);
  const selectedBus = useMemo(() => buses.find((b) => b.id === selectedBusId), [buses, selectedBusId]);

  useEffect(() => {
    if (!selectedBusId) return;
    setLoading(true);
    service.getBookedSeats(selectedBusId, date)
      .then(setBookedSeats)
      .catch(() => setBookedSeats([]))
      .finally(() => setLoading(false));
  }, [selectedBusId, date]);

  const availableCount = selectedBus ? selectedBus.seatCapacity - bookedSeats.length : 0;
  const fillPct = selectedBus ? Math.round((bookedSeats.length / selectedBus.seatCapacity) * 100) : 0;

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedBusId}
          onChange={(e) => setSelectedBusId(e.target.value)}
          className="flex-1 px-3 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
        >
          <option value="">Select a bus…</option>
          {activeBuses.map((b) => (
            <option key={b.id} value={b.id}>{b.name} ({b.startPoint} → {b.endPoint})</option>
          ))}
        </select>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-9 pr-3 py-2.5 text-sm bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />
        </div>
      </div>

      {!selectedBusId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Grid3x3 className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground text-sm">Select a bus to view seat availability</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary bar */}
          {selectedBus && (
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground text-sm">{selectedBus.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedBus.startPoint} → {selectedBus.endPoint} · {date}</p>
                </div>
                <button
                  onClick={() => {
                    setLoading(true);
                    service.getBookedSeats(selectedBusId, date)
                      .then(setBookedSeats).catch(() => setBookedSeats([]))
                      .finally(() => setLoading(false));
                  }}
                  className="p-1.5 hover:bg-muted rounded-lg text-muted-foreground"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs mb-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-muted-foreground">Booked ({bookedSeats.length})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-950/50 border border-green-200 dark:border-green-800" />
                  <span className="text-muted-foreground">Available ({availableCount})</span>
                </div>
                <span className="ml-auto font-semibold text-foreground">{fillPct}% full</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${fillPct >= 90 ? "bg-red-500" : fillPct >= 60 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Seat grid */}
          {selectedBus && (
            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                Seat Map — {selectedBus.seatCapacity} seats
              </p>
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              ) : (
                <SeatGrid capacity={selectedBus.seatCapacity} booked={bookedSeats} />
              )}
            </div>
          )}

          {/* Booked seat list */}
          {bookedSeats.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Booked Seats</p>
              <div className="flex flex-wrap gap-1.5">
                {bookedSeats.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 rounded-lg text-xs font-mono font-bold">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
