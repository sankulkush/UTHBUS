'use client';

import { useState, useEffect } from 'react';
import {
  Filter, X, Snowflake, Wind, Bus, BusFront, Sun, Moon,
  Wifi, Zap, Armchair, Tv, Droplet, Video
} from 'lucide-react';
import type { IBus } from "@/components/operator/counter/types/counter.types";

export interface FilterState {
  busType: string[];
  isAC: boolean | null;
  priceRange: [number, number];
  amenities: string[];
  departureTime: string[];
}

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  buses: IBus[];
}

const BUS_TYPES = [
  { id: 'Micro',  label: 'Micro',  icon: Bus },
  { id: 'Deluxe', label: 'Deluxe', icon: BusFront },
];

const AMENITIES = [
  { id: 'Sofa Seat',      label: 'Sofa Seat',      icon: Armchair },
  { id: 'wifi',           label: 'Wi-Fi',           icon: Wifi },
  { id: 'charging Point', label: 'Charging Point',  icon: Zap },
  { id: 'TV',             label: 'TV',              icon: Tv },
  { id: 'water',          label: 'Water Bottle',    icon: Droplet },
  { id: 'cctv',           label: 'CCTV',            icon: Video },
];

const DEPARTURE_TIMES = [
  { id: 'day',   label: 'Day',   icon: Sun,  description: 'Before 12 PM' },
  { id: 'night', label: 'Night', icon: Moon, description: 'After 12 PM' },
];

export default function Filters({ filters, onFiltersChange, buses = [] }: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastMaxPrice, setLastMaxPrice] = useState(0);

  const maxPrice = buses.length > 0 ? Math.max(...buses.map((b) => b.price)) : 5000;

  useEffect(() => {
    if (buses.length > 0 && maxPrice !== lastMaxPrice) {
      const shouldReset =
        filters.priceRange[1] < maxPrice ||
        lastMaxPrice === 0 ||
        Math.abs(maxPrice - lastMaxPrice) > lastMaxPrice * 0.5;
      if (shouldReset) {
        onFiltersChange({ ...filters, priceRange: [0, maxPrice] });
      }
      setLastMaxPrice(maxPrice);
    }
  }, [maxPrice, buses.length, filters, onFiltersChange, lastMaxPrice]);

  const toggle = <T,>(arr: T[], item: T) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  const clearFilters = () =>
    onFiltersChange({ busType: [], isAC: null, priceRange: [0, maxPrice], amenities: [], departureTime: [] });

  const hasActiveFilters =
    filters.busType.length > 0 ||
    filters.isAC !== null ||
    filters.priceRange[0] !== 0 ||
    filters.priceRange[1] !== maxPrice ||
    filters.amenities.length > 0 ||
    filters.departureTime.length > 0;

  const minPercent = Math.max(0, Math.min(100, (filters.priceRange[0] / maxPrice) * 100));
  const maxPercent = Math.max(0, Math.min(100, (filters.priceRange[1] / maxPrice) * 100));

  // Shared chip class helpers
  const chipBase = "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-colors";
  const chipActive = "bg-primary/10 border-primary text-primary";
  const chipInactive = "bg-background border-border text-foreground hover:bg-muted/60";

  const FilterPanel = () => (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-foreground">Filters</h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden p-1 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* AC / Non-AC */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Air Conditioning
        </h4>
        <div className="flex gap-2">
          <button
            onClick={() => onFiltersChange({ ...filters, isAC: filters.isAC === true ? null : true })}
            className={`${chipBase} ${filters.isAC === true ? chipActive : chipInactive}`}
          >
            <Snowflake className="w-4 h-4" />
            AC
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, isAC: filters.isAC === false ? null : false })}
            className={`${chipBase} ${filters.isAC === false ? chipActive : chipInactive}`}
          >
            <Wind className="w-4 h-4" />
            Non-AC
          </button>
        </div>
      </div>

      {/* Bus Type */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Bus Type
        </h4>
        <div className="flex flex-wrap gap-2">
          {BUS_TYPES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onFiltersChange({ ...filters, busType: toggle(filters.busType, id) })}
              className={`${chipBase} ${filters.busType.includes(id) ? chipActive : chipInactive}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Departure Time
        </h4>
        <div className="flex gap-2">
          {DEPARTURE_TIMES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onFiltersChange({ ...filters, departureTime: toggle(filters.departureTime, id) })}
              className={`${chipBase} ${filters.departureTime.includes(id) ? chipActive : chipInactive}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Price Range
        </h4>
        <div className="space-y-4">
          <div className="relative h-6 flex items-center">
            <div className="absolute w-full h-1 bg-muted rounded-lg" />
            <div
              className="absolute h-1 bg-primary rounded-lg"
              style={{ left: `${minPercent}%`, width: `${Math.max(0, maxPercent - minPercent)}%` }}
            />
            <input
              type="range" min="0" max={maxPrice}
              value={Math.min(filters.priceRange[0], maxPrice)}
              onChange={(e) => {
                const v = Math.min(parseInt(e.target.value), filters.priceRange[1]);
                onFiltersChange({ ...filters, priceRange: [v, filters.priceRange[1]] });
              }}
              className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-10 filter-range-thumb"
            />
            <input
              type="range" min="0" max={maxPrice}
              value={Math.min(filters.priceRange[1], maxPrice)}
              onChange={(e) => {
                const v = Math.max(parseInt(e.target.value), filters.priceRange[0]);
                onFiltersChange({ ...filters, priceRange: [filters.priceRange[0], v] });
              }}
              className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-20 filter-range-thumb"
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>NPR {Math.min(filters.priceRange[0], maxPrice).toLocaleString()}</span>
            <span>NPR {Math.min(filters.priceRange[1], maxPrice).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Amenities
        </h4>
        <div className="grid grid-cols-3 gap-2">
          {AMENITIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onFiltersChange({ ...filters, amenities: toggle(filters.amenities, id) })}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-xs transition-colors ${
                filters.amenities.includes(id) ? chipActive : chipInactive
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-center leading-tight">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2 text-foreground hover:bg-muted/60 transition-colors shadow-soft"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed right-0 top-0 h-full w-80 bg-card shadow-soft-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <FilterPanel />
          </div>
        </div>
      )}

      {/* Desktop panel */}
      <div className="hidden lg:block bg-card rounded-xl border border-border shadow-soft">
        <FilterPanel />
      </div>

      {/* Slider thumb styles — use CSS variable for color */}
      <style>{`
        .filter-range-thumb { pointer-events: none; }
        .filter-range-thumb::-webkit-slider-thumb {
          appearance: none; height: 16px; width: 16px; border-radius: 50%;
          background: white; cursor: pointer; pointer-events: auto;
          border: 2px solid hsl(var(--primary)); box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
        .filter-range-thumb::-moz-range-thumb {
          height: 16px; width: 16px; border-radius: 50%;
          background: white; cursor: pointer; pointer-events: auto;
          border: 2px solid hsl(var(--primary)); box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        }
      `}</style>
    </>
  );
}
