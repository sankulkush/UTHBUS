'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { SortAsc, SortDesc } from 'lucide-react';
import { cn } from '@/lib/utils';
import BusCard from './BusCard';
import { ActiveBookingsService } from '@/components/operator/counter/services/active-booking.service';
import type { IBus } from "@/components/operator/counter/types/counter.types";
import type { UserProfile } from '@/contexts/user-auth-context';

export interface FilterState {
  busType: string[];
  isAC: boolean | null;
  priceRange: [number, number];
  amenities: string[];
  departureTime: string[];
}

interface ResultsListProps {
  buses: IBus[];
  loading: boolean;
  error: string | null;
  onBookBus: (bookingData: {
    busId: string;
    passengerName: string;
    passengerPhone: string;
    seatNumber: string;
    totalPrice: number;
    boardingPoint?: string;
    droppingPoint?: string;
  }) => Promise<void>;
  filters: FilterState;
  currentUser?: UserProfile | null;
  searchDate?: string;
}

type SortOption = 'departure' | 'price' | 'duration';
type SortOrder  = 'asc' | 'desc';

export default function ResultsList({
  buses, loading, error, onBookBus, filters, currentUser, searchDate
}: ResultsListProps) {
  const [sortBy, setSortBy]       = useState<SortOption>('departure');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [bookedSeatsMap, setBookedSeatsMap] = useState<{ [busId: string]: string[] }>({});

  const activeBookingsService = useMemo(() => new ActiveBookingsService(), []);
  const travelDate = useMemo(() => searchDate || new Date().toISOString().split('T')[0], [searchDate]);

  const calculateDuration = useCallback((departure: string, arrival: string) => {
    const dep = new Date(`2024-01-01T${departure}`);
    const arr = new Date(`2024-01-01T${arrival}`);
    if (arr < dep) arr.setDate(arr.getDate() + 1);
    return arr.getTime() - dep.getTime();
  }, []);

  useEffect(() => {
    let mounted = true;
    if (!buses.length) return;

    (async () => {
      const map: { [busId: string]: string[] } = {};
      await Promise.all(
        buses.map(async (bus) => {
          try {
            map[bus.id] = await activeBookingsService.getBookedSeats(bus.id, travelDate);
          } catch {
            map[bus.id] = [];
          }
        })
      );
      if (mounted) setBookedSeatsMap(map);
    })();

    return () => { mounted = false; };
  }, [buses, travelDate, activeBookingsService]);

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      if (filters.busType.length > 0 && !filters.busType.includes(bus.type)) return false;
      if (filters.isAC !== null && bus.isAC !== filters.isAC) return false;
      if (bus.price < filters.priceRange[0] || bus.price > filters.priceRange[1]) return false;
      if (filters.amenities.length > 0 && !filters.amenities.every((a) => bus.amenities?.includes(a))) return false;
      if (filters.departureTime.length > 0) {
        const h = parseInt(bus.departureTime.split(':')[0]);
        const isDay = h >= 4 && h <= 13;
        const isNight = h >= 14 || h < 4;
        const ok = (filters.departureTime.includes('day') && isDay) || (filters.departureTime.includes('night') && isNight);
        if (!ok) return false;
      }
      return true;
    });
  }, [buses, filters]);

  const sortedBuses = useMemo(() => {
    return [...filteredBuses].sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'departure') cmp = a.departureTime.localeCompare(b.departureTime);
      if (sortBy === 'price')     cmp = a.price - b.price;
      if (sortBy === 'duration')  cmp = calculateDuration(a.departureTime, a.arrivalTime) - calculateDuration(b.departureTime, b.arrivalTime);
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [filteredBuses, sortBy, sortOrder, calculateDuration]);

  const handleSort = useCallback((option: SortOption) => {
    if (sortBy === option) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(option); setSortOrder('asc'); }
  }, [sortBy, sortOrder]);

  const handleBookingWrapper = useCallback(async (bookingData: any) => {
    await onBookBus(bookingData);
    const updated = await activeBookingsService.getBookedSeats(bookingData.busId, travelDate);
    setBookedSeatsMap((prev) => ({ ...prev, [bookingData.busId]: updated }));
  }, [onBookBus, activeBookingsService, travelDate]);

  if (loading) {
    return (
      <div className="lg:w-3/4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 bg-muted rounded w-32 animate-pulse" />
          <div className="h-9 bg-muted rounded w-48 animate-pulse" />
        </div>
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6 animate-pulse">
            <div className="flex justify-between items-start mb-4">
              <div className="h-5 bg-muted rounded w-48" />
              <div className="h-8 bg-muted rounded w-24" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-4 bg-muted rounded w-16" />
              <div className="h-4 bg-muted rounded w-20" />
            </div>
            <div className="flex justify-between items-center">
              <div className="h-8 bg-muted rounded w-32" />
              <div className="h-10 bg-muted rounded w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="lg:w-3/4">
        <div className="text-center py-12">
          <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 max-w-md mx-auto">
            <p className="text-destructive font-medium mb-1">Error Loading Buses</p>
            <p className="text-destructive/80 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sortedBuses.length) {
    return (
      <div className="lg:w-3/4">
        <div className="text-center py-12">
          <div className="bg-muted/50 border border-border rounded-xl p-6 max-w-md mx-auto">
            <p className="text-foreground font-medium mb-1">No buses found</p>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search criteria or filters to find available buses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const sortBtn = (option: SortOption, label: string) => (
    <button
      onClick={() => handleSort(option)}
      className={cn(
        "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
        sortBy === option
          ? "bg-card text-foreground shadow-soft"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {sortBy === option && (
        sortOrder === 'asc'
          ? <SortAsc className="inline w-3 h-3 ml-1" />
          : <SortDesc className="inline w-3 h-3 ml-1" />
      )}
    </button>
  );

  return (
    <div className="lg:w-3/4 space-y-4">
      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-soft">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{sortedBuses.length}</span> buses found
          {filteredBuses.length !== buses.length && (
            <span className="ml-1.5">(filtered from {buses.length})</span>
          )}
          {searchDate && (
            <span className="inline-flex items-center ml-2 px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">
              {new Date(searchDate).toLocaleDateString()}
            </span>
          )}
        </p>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by</span>
          <div className="flex bg-muted rounded-lg p-1 gap-0.5">
            {sortBtn('departure', 'Time')}
            {sortBtn('price', 'Price')}
            {sortBtn('duration', 'Duration')}
          </div>
        </div>
      </div>

      {/* Bus cards */}
      <div className="space-y-4">
        {sortedBuses.map((bus) => (
          <BusCard
            key={bus.id}
            bus={bus}
            onBook={handleBookingWrapper}
            viewMode="list"
            bookedSeats={bookedSeatsMap[bus.id] || []}
            currentUser={currentUser}
            searchDate={searchDate}
          />
        ))}
      </div>
    </div>
  );
}
