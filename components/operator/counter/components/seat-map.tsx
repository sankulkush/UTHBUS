"use client";

import type { IBus } from "../types/counter.types";

interface SeatCell { label: string; booked: boolean; selected: boolean; na: boolean }
type SeatRow = (SeatCell | null)[];

function buildBusLayout(busType: string, booked: string[], selected: string[], na: string[]): SeatRow[] {
  const cell = (label: string): SeatCell => ({
    label,
    booked: booked.includes(label),
    selected: selected.includes(label),
    na: na.includes(label),
  });

  if (busType === "Micro") {
    return Array.from({ length: 5 }, (_, r) => [
      cell(`A${r + 1}`), cell(`B${r + 1}`), cell(`C${r + 1}`),
    ]);
  }

  if (busType === "Hiace") {
    return Array.from({ length: 5 }, (_, r) => {
      const base = r * 3;
      return [cell(`H${base + 1}`), cell(`H${base + 2}`), null, cell(`H${base + 3}`)];
    });
  }

  // Deluxe / AC Deluxe — 36 seats
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

// ── Shared container ──────────────────────────────────────────────────────────

function SeatMapShell({
  legend, children,
}: {
  legend: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-muted/30 dark:bg-muted/15 border border-border/60 p-3.5 inline-block">
      <div className="flex justify-end mb-3">
        <div className="w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
          <img src="/steering-wheel.svg" alt="" className="w-6 h-6 opacity-50 dark:invert dark:opacity-30" />
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 mb-3">{legend}</div>
      <div className="rounded-xl border-2 border-dashed border-border/60 bg-card/50 p-2.5">
        <div className="space-y-1.5">{children}</div>
      </div>
    </div>
  );
}

// ── View-only map (seats.page.tsx) ────────────────────────────────────────────

export function SeatMapView({ bus, booked }: { bus: IBus; booked: string[] }) {
  const na = bus.naSeats ?? [];
  const layout = buildBusLayout(bus.type, booked, [], na);

  return (
    <SeatMapShell
      legend={
        <>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-background border border-border shadow-sm inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-muted/60 border border-border/40 inline-block" />
            Booked
          </span>
          {na.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 border border-dashed border-slate-400 dark:border-slate-500 inline-block" />
              N/A
            </span>
          )}
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
                title={cell.na ? `${cell.label} — N/A` : cell.label}
                className={`w-[34px] h-[34px] rounded-lg text-[10px] font-semibold flex items-center justify-center border select-none shadow-sm ${
                  cell.na
                    ? "bg-slate-100 dark:bg-slate-800 border-dashed border-slate-400 dark:border-slate-600 text-slate-400 dark:text-slate-500"
                    : cell.booked
                    ? "bg-muted/60 border-border/50 text-muted-foreground/35 line-through"
                    : "bg-background border-border/80 text-foreground"
                }`}
              >
                {cell.na ? "—" : cell.label}
              </div>
            )
          )}
        </div>
      ))}
    </SeatMapShell>
  );
}

// ── Interactive picker (book-ticket.page.tsx + public BusCard) ────────────────

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
  const na = bus.naSeats ?? [];
  const layout = buildBusLayout(bus.type, booked, selected, na);

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
          {na.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 border border-dashed border-slate-400 dark:border-slate-500 inline-block" />
              N/A
            </span>
          )}
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
                disabled={cell.booked || cell.na}
                onClick={() => onToggle(cell.label)}
                title={
                  cell.na ? `${cell.label} — Not available`
                  : cell.booked ? `${cell.label} — Booked`
                  : cell.label
                }
                className={`w-[34px] h-[34px] rounded-lg text-[10px] font-semibold flex items-center justify-center border transition-all duration-100 select-none shadow-sm ${
                  cell.na
                    ? "bg-slate-100 dark:bg-slate-800 border-dashed border-slate-400 dark:border-slate-600 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                    : cell.selected
                    ? "bg-primary border-primary text-primary-foreground cursor-pointer shadow-md ring-2 ring-primary/30 scale-105"
                    : cell.booked
                    ? "bg-muted/60 border-border/50 text-muted-foreground/35 cursor-not-allowed line-through"
                    : "bg-background border-border/80 text-foreground hover:border-primary hover:bg-primary/10 cursor-pointer hover:shadow-md"
                }`}
              >
                {cell.na ? "—" : cell.label}
              </button>
            )
          )}
        </div>
      ))}
    </SeatMapShell>
  );
}

// ── Operator N/A seat editor ──────────────────────────────────────────────────
// Used in buses.page.tsx to let operators toggle seats as N/A.
// Warns before marking a booked seat N/A.

export function SeatMapNAEditor({
  bus,
  booked,
  naSeats,
  onToggleNA,
}: {
  bus: IBus;
  booked: string[];
  naSeats: string[];
  onToggleNA: (seat: string, isCurrentlyBooked: boolean) => void;
}) {
  const layout = buildBusLayout(bus.type, booked, [], naSeats);

  return (
    <SeatMapShell
      legend={
        <>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-background border border-border shadow-sm inline-block" />
            Available
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-muted/60 border border-border/40 inline-block" />
            Booked
          </span>
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <span className="w-3.5 h-3.5 rounded bg-slate-200 dark:bg-slate-700 border border-dashed border-slate-400 inline-block" />
            N/A
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
                onClick={() => onToggleNA(cell.label, cell.booked)}
                title={
                  cell.na ? `${cell.label} — N/A (click to restore)`
                  : cell.booked ? `${cell.label} — Booked (mark N/A with warning)`
                  : `${cell.label} — Click to mark N/A`
                }
                className={`w-[34px] h-[34px] rounded-lg text-[10px] font-semibold flex items-center justify-center border transition-all duration-100 select-none shadow-sm ${
                  cell.na
                    ? "bg-slate-100 dark:bg-slate-800 border-dashed border-slate-400 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-primary"
                    : cell.booked
                    ? "bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100"
                    : "bg-background border-border/80 text-foreground hover:border-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                }`}
              >
                {cell.na ? "—" : cell.label}
              </button>
            )
          )}
        </div>
      ))}
    </SeatMapShell>
  );
}
