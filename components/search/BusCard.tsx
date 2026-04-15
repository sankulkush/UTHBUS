'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Clock, MapPin, Wifi, Snowflake, Monitor, Utensils, Armchair, Star,
  ChevronDown, ChevronUp, Users, ImageIcon,
} from 'lucide-react';
import type { IBus } from '@/components/operator/counter/types/counter.types';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SeatCell { label: string; booked: boolean; selected: boolean }
type SeatRow = (SeatCell | null)[];
type TabId = 'amenities' | 'boarding' | 'dropping' | 'rest-stop' | 'reviews';

interface BusCardProps {
  bus: IBus;
  onSelectSeats: (bus: IBus, seats: string[]) => void;
  viewMode?: 'list';
  bookedSeats: string[];
  currentUser?: { fullName?: string; phoneNumber?: string } | null;
  searchDate?: string;
}

// ── Seat layout ────────────────────────────────────────────────────────────────

function buildLayout(bus: IBus, booked: string[], selected: string[]): SeatRow[] {
  const cell = (label: string): SeatCell => ({
    label, booked: booked.includes(label), selected: selected.includes(label),
  });
  if (bus.type === 'Micro') {
    return Array.from({ length: 5 }, (_, r) => [
      cell(`A${r + 1}`), cell(`B${r + 1}`), cell(`C${r + 1}`),
    ]);
  }
  const rows: SeatRow[] = [];
  for (let r = 0; r < 9; r++) {
    if (r === 0)      rows.push([cell('A'),   cell('B'),   null, cell('क'), cell('ख')]);
    else if (r === 1) rows.push([cell('C'),   cell('D'),   null, cell('ग'), cell('घ')]);
    else {
      const n = (r - 2) * 2 + 1;
      rows.push([cell(`A${n}`), cell(`A${n+1}`), null, cell(`B${n}`), cell(`B${n+1}`)]);
    }
  }
  return rows;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getAmenityIcon(amenity: string): React.ElementType {
  const map: Record<string, React.ElementType> = {
    WiFi: Wifi, wifi: Wifi, AC: Snowflake, TV: Monitor,
    Snacks: Utensils, 'Water Bottle': Utensils, water: Utensils,
    Blanket: Armchair, Pillow: Armchair, 'Sofa Seat': Armchair,
    'Charging Port': Monitor, 'charging Point': Monitor, cctv: Monitor,
    Entertainment: Monitor, 'Rest Stops': MapPin,
  };
  return map[amenity] || Star;
}

const AMENITY_ICON_TAB: Record<string, React.ElementType> = {
  WiFi: Wifi, wifi: Wifi, AC: Snowflake, TV: Monitor,
  Snacks: Utensils, 'Water Bottle': Utensils, water: Utensils,
  Blanket: Armchair, Pillow: Armchair, 'Sofa Seat': Armchair,
  'Charging Port': Monitor, 'charging Point': Monitor, cctv: Monitor,
  Entertainment: Monitor, 'Rest Stops': MapPin,
};

function fmt12(t: string) {
  try {
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
  } catch { return t; }
}

function calcDuration(dep: string, arr: string) {
  const d = new Date(`2024-01-01T${dep}`);
  const a = new Date(`2024-01-01T${arr}`);
  if (a < d) a.setDate(a.getDate() + 1);
  const ms = a.getTime() - d.getTime();
  return `${Math.floor(ms / 3_600_000)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`;
}

function getBusTypeColor(type: string) {
  switch (type) {
    case 'AC Deluxe': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'Micro':     return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    default:          return 'bg-muted text-muted-foreground';
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function BusCard({ bus, onSelectSeats, bookedSeats, searchDate }: BusCardProps) {
  const [expanded, setExpanded]       = useState(false);
  const [selected, setSelected]       = useState<string[]>([]);
  const [activeTab, setActiveTab]     = useState<TabId>('amenities');
  const [showDetails, setShowDetails] = useState(false);
  const cardRef                       = useRef<HTMLDivElement>(null);

  const layout = useMemo(
    () => buildLayout(bus, bookedSeats, selected),
    [bus, bookedSeats, selected],
  );

  const availableCount = useMemo(
    () => layout.flat().filter((c): c is SeatCell => c !== null && !c.booked).length,
    [layout],
  );

  useEffect(() => {
    if (!expanded) { setSelected([]); setShowDetails(true); setActiveTab('amenities'); }
  }, [expanded]);

  useEffect(() => {
    if (expanded)
      setTimeout(() => cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) setExpanded(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  const toggleSeat = useCallback((label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label],
    );
  }, []);

  const handleContinue = useCallback(() => {
    if (!selected.length) return;
    onSelectSeats(bus, selected);
  }, [bus, selected, onSelectSeats]);

  // ── Seat cell ─────────────────────────────────────────────────────────────

  const renderCell = (cell: SeatCell) => {
    let cls = 'w-[34px] h-[34px] rounded-lg text-[10px] font-semibold flex items-center justify-center border transition-all duration-100 select-none shadow-sm ';
    if (cell.booked) {
      cls += 'bg-muted/60 border-border/50 text-muted-foreground/35 cursor-not-allowed line-through';
    } else if (cell.selected) {
      cls += 'bg-primary border-primary text-primary-foreground cursor-pointer shadow-md ring-2 ring-primary/30 scale-105';
    } else {
      cls += 'bg-background border-border/80 text-foreground hover:border-primary hover:bg-primary/10 cursor-pointer hover:shadow-md';
    }
    return (
      <button
        key={cell.label}
        className={cls}
        disabled={cell.booked}
        onClick={() => toggleSeat(cell.label)}
        type="button"
        title={cell.booked ? `${cell.label} — Booked` : cell.label}
      >
        {cell.label}
      </button>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div
      ref={cardRef}
      className="bg-card rounded-xl border border-border hover:shadow-soft-md transition-all duration-300 overflow-hidden"
    >
      {/* ── Collapsed header ─────────────────────────────────────────────── */}
      <div
        className="p-3 md:p-6 cursor-pointer hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* ── Mobile ── */}
        <div className="block md:hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="inline-flex items-center flex-wrap gap-1.5 text-base font-semibold text-foreground">
                <span className="truncate">{bus.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getBusTypeColor(bus.type)}`}>
                  {bus.type}
                </span>
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                <span className="text-xs font-medium text-foreground">4.8</span>
              </div>
              {bus.model && (
                <div className="text-xs text-muted-foreground mt-0.5 truncate">{bus.model}</div>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">रु {bus.price.toLocaleString()}</div>
              {expanded
                ? <ChevronUp className="w-4 h-4 ml-auto mt-1 text-muted-foreground" />
                : <ChevronDown className="w-4 h-4 ml-auto mt-1 text-muted-foreground" />
              }
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-center flex-shrink-0">
              <div className="text-base font-semibold text-foreground">{fmt12(bus.departureTime)}</div>
              <div className="text-xs text-muted-foreground truncate">{bus.startPoint}</div>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1 mx-2">
              <div className="text-xs text-muted-foreground">
                {calcDuration(bus.departureTime, bus.arrivalTime)}
              </div>
              <div className="w-full h-px bg-border relative max-w-[120px]">
                <div className="absolute left-0 top-0 w-1.5 h-1.5 bg-green-500 rounded-full -translate-y-1/2" />
                <div className="absolute right-0 top-0 w-1.5 h-1.5 bg-red-500 rounded-full -translate-y-1/2" />
              </div>
              <Clock className="w-3 h-3 text-muted-foreground" />
            </div>
            <div className="text-center flex-shrink-0">
              <div className="text-base font-semibold text-foreground">{fmt12(bus.arrivalTime)}</div>
              <div className="text-xs text-muted-foreground truncate">{bus.endPoint}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {(bus.amenities || []).slice(0, 4).map((a) => {
              const Icon = getAmenityIcon(a);
              return (
                <span key={a} className="inline-flex items-center gap-1 px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[60px]">{a}</span>
                </span>
              );
            })}
            {(bus.amenities || []).length > 4 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground rounded-full text-xs">
                +{(bus.amenities || []).length - 4} more
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{availableCount} seats available</span>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${expanded ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'}`}>
              {expanded ? 'Hide seats' : 'View seats'}
            </span>
          </div>
        </div>

        {/* ── Desktop ── */}
        <div className="hidden md:flex items-center justify-between">
          {/* Left: name, meta, chips */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h3 className="text-xl font-semibold text-foreground">{bus.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBusTypeColor(bus.type)}`}>
                {bus.type}
              </span>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">4.8</span>
              </div>
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground mb-3">
              {bus.model && (
                <div className="flex items-center gap-1">
                  <span>{bus.model}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{availableCount} seats</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {(bus.amenities || []).slice(0, 4).map((a) => {
                const Icon = getAmenityIcon(a);
                return (
                  <span key={a} className="inline-flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                    <Icon className="w-3 h-3" />
                    {a}
                  </span>
                );
              })}
              {(bus.amenities || []).length > 4 && (
                <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm">
                  +{(bus.amenities || []).length - 4} more
                </span>
              )}
            </div>
          </div>

          {/* Right: times + price */}
          <div className="flex items-center gap-8 flex-shrink-0 ml-6">
            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">{fmt12(bus.departureTime)}</div>
              <div className="text-sm text-muted-foreground">{bus.startPoint}</div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <div className="text-sm text-muted-foreground">
                {calcDuration(bus.departureTime, bus.arrivalTime)}
              </div>
              <div className="w-20 h-px bg-border" />
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>

            <div className="text-center">
              <div className="text-xl font-semibold text-foreground">{fmt12(bus.arrivalTime)}</div>
              <div className="text-sm text-muted-foreground">{bus.endPoint}</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">रु {bus.price.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-2 justify-center">
                <span className="text-sm text-primary">
                  {expanded ? 'Hide seats' : 'View seats'}
                </span>
                {expanded
                  ? <ChevronUp className="w-4 h-4 text-primary" />
                  : <ChevronDown className="w-4 h-4 text-primary" />
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded ─────────────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-border" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 sm:p-5">
            <div className="flex flex-col xl:flex-row gap-5">

              {/* Seat map */}
              <div className="xl:w-[220px] shrink-0">
                <div className="rounded-2xl bg-muted/30 dark:bg-muted/15 border border-border/60 p-3.5">
                  <div className="flex justify-end mb-3">
                    <div className="w-10 h-10 rounded-full bg-card border border-border shadow-sm flex items-center justify-center">
                      <img
                        src="/steering-wheel.svg"
                        alt=""
                        className="w-6 h-6 opacity-50 dark:invert dark:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <span className="w-3.5 h-3.5 rounded bg-background border border-border shadow-sm inline-block" />
                      Available
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <span className="w-3.5 h-3.5 rounded bg-primary inline-block" />
                      Selected
                    </span>
                    <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <span className="w-3.5 h-3.5 rounded bg-muted border border-border/40 inline-block" />
                      Booked
                    </span>
                  </div>

                  <div className="rounded-xl border-2 border-dashed border-border/60 bg-card/50 p-2.5">
                    <div className="space-y-1.5">
                      {layout.map((row, ri) => (
                        <div key={ri} className="flex items-center gap-1 justify-center">
                          {row.map((cell, ci) =>
                            cell === null
                              ? <div key={`aisle-${ri}-${ci}`} className="w-3" />
                              : renderCell(cell),
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {searchDate && (
                    <p className="mt-2.5 text-[10px] text-muted-foreground text-center">
                      {new Date(searchDate).toLocaleDateString('en-US', {
                        weekday: 'short', month: 'short', day: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Bus details */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => setShowDetails((v) => !v)}
                  className="xl:hidden w-full flex items-center justify-between text-sm font-medium text-foreground mb-3 py-2 px-3 bg-muted/50 rounded-lg border border-border"
                >
                  Bus Details
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                <div className={`xl:block ${showDetails ? 'block' : 'hidden'}`}>
                  <h3 className="font-bold text-lg text-foreground mb-3">{bus.name}</h3>

                  <div className="flex gap-2.5 mb-4">
                    {(bus.photos || []).length > 0
                      ? bus.photos.slice(0, 2).map((src, i) => (
                          <div key={i} className="w-32 h-[88px] rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))
                      : [0, 1].map((i) => (
                          <div key={i} className="w-32 h-[88px] rounded-xl bg-muted/40 border border-dashed border-border/60 flex flex-col items-center justify-center gap-1.5 shrink-0">
                            <ImageIcon className="w-5 h-5 text-muted-foreground/30" />
                            <span className="text-[10px] text-muted-foreground/40">No Image</span>
                          </div>
                        ))}
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-border mb-3">
                    <div className="flex overflow-x-auto">
                      {(
                        [
                          ['amenities', 'Amenities'],
                          ['boarding',  'Boarding'],
                          ['dropping',  'Dropping'],
                          ['rest-stop', 'Rest Stops'],
                          ['reviews',   'Reviews'],
                        ] as [TabId, string][]
                      ).map(([id, label]) => (
                        <button
                          key={id}
                          onClick={() => setActiveTab(id)}
                          className={`px-3 py-2 text-sm font-medium shrink-0 border-b-2 transition-colors ${
                            activeTab === id
                              ? 'border-primary text-primary'
                              : 'border-transparent text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="min-h-[90px]">
                    {activeTab === 'amenities' && (
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                        {(bus.amenities || []).length > 0
                          ? bus.amenities.map((a) => {
                              const Icon = AMENITY_ICON_TAB[a] || Star;
                              return (
                                <div key={a} className="flex items-center gap-2 text-sm text-foreground">
                                  <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> {a}
                                </div>
                              );
                            })
                          : <p className="text-sm text-muted-foreground col-span-2">No amenities listed</p>
                        }
                      </div>
                    )}
                    {activeTab === 'boarding' && (
                      <div className="space-y-2">
                        {(bus.boardingPoints || []).length > 0
                          ? bus.boardingPoints.map((p) => (
                              <div key={p} className="flex items-center gap-2 text-sm text-foreground">
                                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> {p}
                              </div>
                            ))
                          : <p className="text-sm text-muted-foreground">No boarding points listed</p>
                        }
                      </div>
                    )}
                    {activeTab === 'dropping' && (
                      <div className="space-y-2">
                        {(bus.droppingPoints || []).length > 0
                          ? bus.droppingPoints.map((p) => (
                              <div key={p} className="flex items-center gap-2 text-sm text-foreground">
                                <MapPin className="w-3.5 h-3.5 text-destructive shrink-0" /> {p}
                              </div>
                            ))
                          : <p className="text-sm text-muted-foreground">No dropping points listed</p>
                        }
                      </div>
                    )}
                    {activeTab === 'rest-stop' && (
                      <p className="text-sm text-muted-foreground">Rest stop info not available</p>
                    )}
                    {activeTab === 'reviews' && (
                      <p className="text-sm text-muted-foreground">No reviews yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Bottom bar ─────────────────────────────────────────────────── */}
          <div className="border-t border-border px-4 sm:px-6 py-3 bg-muted/20 dark:bg-muted/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

              {/* Step indicator */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className="flex items-center gap-1.5 font-semibold text-primary">
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold shrink-0">
                    1
                  </span>
                  Select seats
                </span>
                <div className="w-6 h-px bg-border" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                    2
                  </span>
                  Passenger Info
                </span>
                <div className="w-6 h-px bg-border" />
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <span className="w-5 h-5 rounded-full border-2 border-border flex items-center justify-center text-[10px] font-bold shrink-0">
                    3
                  </span>
                  Review &amp; Pay
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selected.length > 0 && (
                  <div className="flex-1 sm:flex-none text-right sm:text-left">
                    <div className="flex flex-wrap gap-1 justify-end sm:justify-start">
                      {selected.map((s) => (
                        <span
                          key={s}
                          onClick={() => toggleSeat(s)}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
                          title="Click to deselect"
                        >
                          {s} ×
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      NPR {(bus.price * selected.length).toLocaleString()}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setExpanded(false)}
                  className="shrink-0 px-4 py-2 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  Close
                </button>

                <button
                  onClick={handleContinue}
                  disabled={selected.length === 0}
                  className="shrink-0 px-5 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] whitespace-nowrap"
                >
                  {selected.length === 0 ? 'Select a seat' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
