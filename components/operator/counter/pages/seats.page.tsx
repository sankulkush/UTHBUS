"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Grid3x3, Calendar, RefreshCw, X, Printer, Bus, Snowflake,
} from "lucide-react";
import { useCounter } from "../context/counter-context";
import { ActiveBookingsService, IActiveBooking } from "../services/active-booking.service";
import { SeatMapView, buildBusLayout } from "../components/seat-map";
import type { IBus } from "../types/counter.types";

const service = new ActiveBookingsService();

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Format a YYYY-MM-DD as a human-readable date
function formatDate(iso: string) {
  try {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: "short", year: "numeric", month: "long", day: "numeric",
    });
  } catch {
    return iso;
  }
}

export function SeatsPage() {
  const { buses } = useCounter();
  const [selected, setSelected] = useState<{ bus: IBus; date: string } | null>(null);
  const [perCardDate, setPerCardDate] = useState<Record<string, string>>({});

  const activeBuses = useMemo(() => buses.filter((b) => b.status === "Active"), [buses]);

  const getDate = (busId: string) => perCardDate[busId] || todayStr();
  const setDate = (busId: string, d: string) =>
    setPerCardDate((p) => ({ ...p, [busId]: d }));

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {activeBuses.length} active bus{activeBuses.length !== 1 ? "es" : ""} · Pick a date and view the seat map
        </p>
      </div>

      {activeBuses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Grid3x3 className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground text-sm">No active buses to display</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {activeBuses.map((bus) => (
            <div key={bus.id} className="bg-card border border-border rounded-xl p-4 space-y-3">
              {/* Bus header */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  <Bus className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground text-sm truncate">
                    {bus.startPoint} → {bus.endPoint}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{bus.name}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    {bus.isAC && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded text-[10px] font-semibold">
                        <Snowflake className="w-2.5 h-2.5" /> AC
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">{bus.type}</span>
                    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">{bus.seatCapacity} seats</span>
                    <span className="px-1.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px]">{bus.departureTime}</span>
                  </div>
                </div>
              </div>

              {/* Date + action */}
              <div className="flex items-stretch gap-2 pt-2 border-t border-border">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="date"
                    value={getDate(bus.id)}
                    onChange={(e) => setDate(bus.id, e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                  />
                </div>
                <button
                  onClick={() => setSelected({ bus, date: getDate(bus.id) })}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:opacity-90 inline-flex items-center gap-1.5"
                >
                  <Grid3x3 className="w-4 h-4" /> View Seats
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <SeatMapModal
          bus={selected.bus}
          date={selected.date}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function SeatMapModal({ bus, date, onClose }: { bus: IBus; date: string; onClose: () => void }) {
  const [bookings, setBookings] = useState<IActiveBooking[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getBookingsForBusOnDate(bus.id, date);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [bus.id, date]);

  useEffect(() => { refresh(); }, [refresh]);

  const bookedSeats = useMemo(() => {
    const seats: string[] = [];
    bookings.forEach((b) => {
      if (Array.isArray(b.seatNumbers) && b.seatNumbers.length) seats.push(...b.seatNumbers);
      else if (b.seatNumber) seats.push(b.seatNumber);
    });
    return seats;
  }, [bookings]);

  const fillPct = bus.seatCapacity > 0
    ? Math.round((bookedSeats.length / bus.seatCapacity) * 100)
    : 0;
  const availableCount = bus.seatCapacity - bookedSeats.length;

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-2 sm:p-4 seat-modal-bg">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl my-2 sm:my-6 shadow-2xl seat-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {bus.startPoint} → {bus.endPoint}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {bus.name} · {formatDate(date)} · Dep {bus.departureTime}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={refresh}
              className="p-2 hover:bg-muted rounded-lg text-muted-foreground"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:opacity-90"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 rounded-lg p-2.5">
              <p className="text-red-700 dark:text-red-400">Booked</p>
              <p className="font-semibold text-foreground mt-0.5 text-sm">{bookedSeats.length}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900/40 rounded-lg p-2.5">
              <p className="text-green-700 dark:text-green-400">Available</p>
              <p className="font-semibold text-foreground mt-0.5 text-sm">{availableCount}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-2.5">
              <p className="text-muted-foreground">Fill</p>
              <p className="font-semibold text-foreground mt-0.5 text-sm">{fillPct}%</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
          ) : (
            <>
              <div className="flex justify-center">
                <SeatMapView bus={bus} booked={bookedSeats} />
              </div>

              {bookings.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    Passengers ({bookings.length} booking{bookings.length !== 1 ? "s" : ""})
                  </p>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold">Seat(s)</th>
                          <th className="text-left px-3 py-2 font-semibold">Passenger</th>
                          <th className="text-left px-3 py-2 font-semibold">Phone</th>
                          <th className="text-left px-3 py-2 font-semibold">Boarding</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => {
                          const seats = (Array.isArray(b.seatNumbers) && b.seatNumbers.length)
                            ? b.seatNumbers.join(", ")
                            : (b.seatNumber ?? "—");
                          return (
                            <tr key={b.id} className="border-t border-border">
                              <td className="px-3 py-2 font-mono font-bold text-foreground">{seats}</td>
                              <td className="px-3 py-2 text-foreground">{b.passengerName}</td>
                              <td className="px-3 py-2 text-muted-foreground">{b.passengerPhone}</td>
                              <td className="px-3 py-2 text-muted-foreground">{b.boardingPoint || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Print-only A4 sheet */}
      <PrintableSeatChart
        bus={bus}
        date={date}
        bookings={bookings}
        bookedSeats={bookedSeats}
      />

      <style>{`
        @media screen {
          .seat-print-sheet { display: none; }
        }
        @media print {
          @page { size: A4; margin: 14mm; }
          html, body { background: white !important; }
          body * { visibility: hidden !important; }
          .seat-print-sheet, .seat-print-sheet * { visibility: visible !important; }
          .seat-print-sheet {
            position: absolute !important;
            left: 0 !important; top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: #000 !important;
          }
        }
      `}</style>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Print-only A4 layout

function PrintableSeatChart({
  bus, date, bookings, bookedSeats,
}: {
  bus: IBus; date: string; bookings: IActiveBooking[]; bookedSeats: string[];
}) {
  const layout = buildBusLayout(bus.type, bookedSeats, []);

  // Per-seat passenger lookup
  const seatToBooking: Record<string, IActiveBooking> = {};
  bookings.forEach((b) => {
    const seats = (Array.isArray(b.seatNumbers) && b.seatNumbers.length)
      ? b.seatNumbers
      : (b.seatNumber ? [b.seatNumber] : []);
    seats.forEach((s) => { seatToBooking[s] = b; });
  });

  return (
    <div
      className="seat-print-sheet"
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        padding: "0",
        color: "#000",
      }}
    >
      {/* Header */}
      <div style={{ borderBottom: "2px solid #000", paddingBottom: "8mm", marginBottom: "6mm" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "22pt", fontWeight: 800, letterSpacing: "-0.5px" }}>
              <span style={{ color: "#2563eb" }}>uth</span>
              <span style={{ color: "#dc2626" }}>bus</span>
              <span style={{ fontSize: "12pt", fontWeight: 500, color: "#444", marginLeft: "8px" }}>
                · Seat Chart
              </span>
            </div>
            <div style={{ fontSize: "18pt", fontWeight: 700, marginTop: "4mm" }}>
              {bus.startPoint} → {bus.endPoint}
            </div>
            <div style={{ fontSize: "11pt", color: "#444", marginTop: "2mm" }}>
              {bus.name} · {bus.type}{bus.isAC ? " · AC" : ""}
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "10pt" }}>
            <div><strong>Date:</strong> {formatDate(date)}</div>
            <div style={{ marginTop: "2mm" }}><strong>Departure:</strong> {bus.departureTime}</div>
            <div style={{ marginTop: "2mm" }}><strong>Arrival:</strong> {bus.arrivalTime}</div>
            <div style={{ marginTop: "2mm" }}>
              <strong>Booked:</strong> {bookedSeats.length} / {bus.seatCapacity}
            </div>
          </div>
        </div>
      </div>

      {/* Seat map */}
      <div style={{ marginBottom: "6mm" }}>
        <div style={{ fontSize: "10pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3mm", color: "#444" }}>
          Seat Map
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            border: "1px solid #999",
            borderRadius: "6px",
            padding: "6mm",
            background: "#fff",
          }}>
            {/* Legend */}
            <div style={{ display: "flex", gap: "8mm", justifyContent: "center", marginBottom: "4mm", fontSize: "9pt" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10pt", height: "10pt", background: "#22c55e", borderRadius: "2px", display: "inline-block" }} />
                Available
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10pt", height: "10pt", background: "#dc2626", borderRadius: "2px", display: "inline-block" }} />
                Booked
              </span>
            </div>
            {/* Seat grid */}
            <div style={{ display: "flex", flexDirection: "column", gap: "3pt" }}>
              {layout.map((row, ri) => (
                <div key={ri} style={{ display: "flex", gap: "3pt", justifyContent: "center", alignItems: "center" }}>
                  {row.map((cell, ci) =>
                    cell === null ? (
                      <div key={`a-${ri}-${ci}`} style={{ width: "10pt" }} />
                    ) : (
                      <div
                        key={cell.label}
                        style={{
                          width: "42pt", height: "42pt",
                          background: cell.booked ? "#dc2626" : "#22c55e",
                          color: "#fff",
                          border: `1px solid ${cell.booked ? "#991b1b" : "#15803d"}`,
                          borderRadius: "4px",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "10pt", fontWeight: 700,
                        }}
                      >
                        {cell.label}
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Passenger table */}
      <div>
        <div style={{ fontSize: "10pt", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3mm", color: "#444" }}>
          Passenger Manifest ({bookings.length})
        </div>
        {bookings.length === 0 ? (
          <div style={{ fontSize: "10pt", color: "#666", textAlign: "center", padding: "10mm", border: "1px dashed #ccc", borderRadius: "6px" }}>
            No bookings on this date.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "10pt" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #000" }}>
                <th style={{ textAlign: "left", padding: "2mm 3mm", fontWeight: 700 }}>Seat</th>
                <th style={{ textAlign: "left", padding: "2mm 3mm", fontWeight: 700 }}>PNR</th>
                <th style={{ textAlign: "left", padding: "2mm 3mm", fontWeight: 700 }}>Passenger Name</th>
                <th style={{ textAlign: "left", padding: "2mm 3mm", fontWeight: 700 }}>Phone</th>
                <th style={{ textAlign: "left", padding: "2mm 3mm", fontWeight: 700 }}>Boarding Point</th>
              </tr>
            </thead>
            <tbody>
              {bookedSeats
                .slice()
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
                .map((seat) => {
                  const b = seatToBooking[seat];
                  return (
                    <tr key={seat} style={{ borderBottom: "1px solid #ddd" }}>
                      <td style={{ padding: "2mm 3mm", fontFamily: "monospace", fontWeight: 700 }}>{seat}</td>
                      <td style={{ padding: "2mm 3mm", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.5px" }}>{b?.pnr || "—"}</td>
                      <td style={{ padding: "2mm 3mm" }}>{b?.passengerName || "—"}</td>
                      <td style={{ padding: "2mm 3mm" }}>{b?.passengerPhone || "—"}</td>
                      <td style={{ padding: "2mm 3mm" }}>{b?.boardingPoint || "—"}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", textAlign: "center", fontSize: "8pt", color: "#888", paddingTop: "4mm", borderTop: "1px solid #ddd" }}>
        Generated by UthBus Counter Portal · For the khalasi / conductor
      </div>
    </div>
  );
}
