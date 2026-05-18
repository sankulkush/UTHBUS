"use client";

import type { IBus } from "../types/counter.types";

interface SeatCell { label: string; booked: boolean; selected: boolean }
type SeatRow = (SeatCell | null)[];

export function buildBusLayout(busType: string, booked: string[], selected: string[]): SeatRow[] {
  const cell = (label: string): SeatCell => ({
    label, booked: booked.includes(label), selected: selected.includes(label),
  });

  if (busType === "Micro") {
    // 5 rows × 3 cols = 15 seats
    return Array.from({ length: 5 }, (_, r) => [
      cell(`A${r + 1}`), cell(`B${r + 1}`), cell(`C${r + 1}`),
    ]);
  }

  if (busType === "Hiace") {
    // 5 rows of 2+1 (aisle between) = 15 seats: H1-H15
    return Array.from({ length: 5 }, (_, r) => {
      const base = r * 3;
      return [cell(`H${base + 1}`), cell(`H${base + 2}`), null, cell(`H${base + 3}`)];
    });
  }

  // Deluxe / AC Deluxe — 36 seats
  // Row 0: A B | क ख
  // Row 1: C D | ग घ
  // Rows 2-8: A1 A2 | B1 B2  ...  A13 A14 | B13 B14
  const rows: SeatRow[] = [];
  for (let r = 0; r < 9; r++) {
    if (r === 0)      rows.push([cell("A"),  cell("B"),  null, cell("क"), cell("ख")]);
    else if (r === 1) rows.push([cell("C"),  cell("D"),  null, cell("ग"), cell("घ")]);
    else {
      const n = (r - 2) * 2 + 1;
      rows.push([cell(`A${n}`), cell(`A${n + 1}`), null, cell(`B${n}`), cell(`B${n + 1}`)]);
    }
  }
  return rows;
}

// ── Shared container that wraps any seat map ──────────────────────────────────

function SeatMapShell({
  legend, children,
}: {
  legend: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-muted/30 dark:bg-muted/15 border border-border/60 p-3.5 inline-block">
      {/* Steering wheel */}
      <div className="flex justify-end mb-3">
        <div className="w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
          <img
            src="/steering-wheel.svg"
            alt=""
            className="w-6 h-6 opacity-50 dark:invert dark:opacity-30"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-3 mb-3">
        {legend}
      </div>

      {/* Grid */}
      <div className="rounded-xl border-2 border-dashed border-border/60 bg-card/50 p-2.5">
        <div className="space-y-1.5">{children}</div>
      </div>
    </div>
  );
}

// ── View-only map (seats.page.tsx) ────────────────────────────────────────────

export function SeatMapView({ bus, booked }: { bus: IBus; booked: string[] }) {
  const layout = buildBusLayout(bus.type, booked, []);

  return (
    <SeatMapShell
      legend={
        <>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-green-500 border border-green-600 inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-600 inline-block" />
            Booked
          </span>
        </>
      }
    >
      {layout.map((row, ri) => (
        <div key={ri} className="flex items-center gap-1 justify-center">
          {row.map((cell, ci) =>
            cell === null ? (
              <div key={`a-${ri}-${ci}`} className="w-3" />
            ) : (
              <div
                key={cell.label}
                title={cell.label}
                className={`w-[34px] h-[34px] rounded-lg text-[10px] font-semibold flex items-center justify-center border select-none shadow-sm ${
                  cell.booked
                    ? "bg-red-500 border-red-600 text-white"
                    : "bg-green-500 border-green-600 text-white"
                }`}
              >
                {cell.label}
              </div>
            )
          )}
        </div>
      ))}
    </SeatMapShell>
  );
}

// ── Interactive picker (book-ticket.page.tsx) ─────────────────────────────────
// Multi-seat selection — click a seat to add, click again to remove. Same UX
// as the user portal's BusCard seat picker.

export function SeatMapPicker({
  bus,
  booked,
  selected,
  onToggle,
}: {
  bus: IBus;
  booked: string[];
  selected: string[];
  onToggle: (seat: string) => void;
}) {
  const layout = buildBusLayout(bus.type, booked, selected);

  return (
    <SeatMapShell
      legend={
        <>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-background border border-border shadow-sm inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-primary inline-block" />
            Selected
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-muted/60 border border-border/40 inline-block" />
            Booked
          </span>
        </>
      }
    >
      {layout.map((row, ri) => (
        <div key={ri} className="flex items-center gap-1 justify-center">
          {row.map((cell, ci) =>
            cell === null ? (
              <div key={`a-${ri}-${ci}`} className="w-3" />
            ) : (
              <button
                key={cell.label}
                type="button"
                disabled={cell.booked}
                onClick={() => onToggle(cell.label)}
                title={cell.booked ? `${cell.label} — Booked` : cell.label}
                className={`w-[34px] h-[34px] rounded-lg text-[10px] font-semibold flex items-center justify-center border transition-all duration-100 select-none shadow-sm ${
                  cell.selected
                    ? "bg-primary border-primary text-primary-foreground cursor-pointer shadow-md ring-2 ring-primary/30 scale-105"
                    : cell.booked
                    ? "bg-muted/60 border-border/50 text-muted-foreground/35 cursor-not-allowed line-through"
                    : "bg-background border-border/80 text-foreground hover:border-primary hover:bg-primary/10 cursor-pointer hover:shadow-md"
                }`}
              >
                {cell.label}
              </button>
            )
          )}
        </div>
      ))}
    </SeatMapShell>
  );
}
