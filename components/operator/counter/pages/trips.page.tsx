"use client";

import { useMemo, useState } from "react";
import { Route, Bus, Users, Clock, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { useCounter } from "../context/counter-context";
import type { IActiveBooking } from "../context/counter-context";

function fmt12(t?: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function fmtDate(ds: string) {
  if (!ds) return "—";
  const [y, m, d] = ds.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function statusBadge(s: string) {
  switch (s) {
    case "booked":    return "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400";
    case "completed": return "bg-green-50 text-green-700 dark:bg-green-950/50 dark:text-green-400";
    case "cancelled": return "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400";
    default:          return "bg-muted text-muted-foreground";
  }
}

interface TripGroup {
  key: string;
  busId: string;
  busName: string;
  busType: string;
  from: string;
  to: string;
  date: string;
  departureTime: string;
  bookings: IActiveBooking[];
  seatCapacity: number;
}

export function TripsPage() {
  const { activeBookings, buses } = useCounter();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState(todayStr());

  const trips = useMemo<TripGroup[]>(() => {
    const map = new Map<string, TripGroup>();

    activeBookings.forEach((b) => {
      const key = `${b.busId}||${b.date}`;
      if (!map.has(key)) {
        const bus = buses.find((bus) => bus.id === b.busId);
        map.set(key, {
          key,
          busId: b.busId,
          busName: b.busName,
          busType: b.busType,
          from: b.from,
          to: b.to,
          date: b.date,
          departureTime: b.time,
          bookings: [],
          seatCapacity: bus?.seatCapacity ?? 0,
        });
      }
      map.get(key)!.bookings.push(b);
    });

    let result = Array.from(map.values()).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.departureTime.localeCompare(b.departureTime);
    });

    if (dateFilter) result = result.filter((t) => t.date === dateFilter);
    return result;
  }, [activeBookings, buses, dateFilter]);

  const toggle = (key: string) => setExpandedKey((k) => (k === key ? null : key));

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Date filter */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
          />
        </div>
        {dateFilter && (
          <button
            onClick={() => setDateFilter("")}
            className="text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg px-3 py-2 hover:bg-muted"
          >
            Show all dates
          </button>
        )}
        <span className="text-xs text-muted-foreground ml-auto">{trips.length} trip{trips.length !== 1 ? "s" : ""}</span>
      </div>

      {trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Route className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground text-sm">No trips found</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            {dateFilter ? "No bookings on this date" : "Trips appear here when bookings are made"}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {trips.map((trip) => {
            const isExpanded = expandedKey === trip.key;
            const activeCount = trip.bookings.filter((b) => b.status === "booked").length;
            const fillPct = trip.seatCapacity
              ? Math.min(100, Math.round((activeCount / trip.seatCapacity) * 100))
              : 0;
            const isToday = trip.date === todayStr();

            return (
              <div key={trip.key} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Trip header */}
                <button
                  onClick={() => toggle(trip.key)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
                >
                  <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center shrink-0">
                    <Bus className="w-4 h-4 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-foreground truncate">{trip.busName}</p>
                      {isToday && (
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-[10px] font-bold">TODAY</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 flex-wrap">
                      <span>{trip.from} → {trip.to}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmt12(trip.departureTime)}</span>
                      <span>·</span>
                      <span>{fmtDate(trip.date)}</span>
                    </div>
                  </div>

                  <div className="shrink-0 text-right mr-2">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm font-bold text-foreground">{activeCount}</span>
                      {trip.seatCapacity > 0 && (
                        <span className="text-xs text-muted-foreground">/{trip.seatCapacity}</span>
                      )}
                    </div>
                    {trip.seatCapacity > 0 && (
                      <div className="w-16 h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${fillPct >= 90 ? "bg-red-500" : fillPct >= 60 ? "bg-yellow-500" : "bg-green-500"}`}
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Passenger list */}
                {isExpanded && (
                  <div className="border-t border-border divide-y divide-border">
                    {trip.bookings.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No bookings</p>
                    ) : (
                      trip.bookings.map((b) => {
                        const seats = b.seatNumbers?.join(", ") || b.seatNumber || "—";
                        return (
                          <div key={b.id} className="flex items-center gap-3 px-4 py-2.5 bg-muted/10">
                            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0">
                              <Users className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground truncate">{b.passengerName}</p>
                              <p className="text-[10px] text-muted-foreground">{b.passengerPhone}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-mono text-muted-foreground">Seat {seats}</span>
                              <div className="flex justify-end mt-0.5">
                                <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-semibold capitalize ${statusBadge(b.status)}`}>
                                  {b.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
