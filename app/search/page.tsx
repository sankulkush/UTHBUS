// app/search/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BusService } from "@/components/operator/counter/services/bus.service";
import { useUserAuth } from "@/contexts/user-auth-context";
import { useBooking } from "@/contexts/booking-context";
import type { IBus } from "@/components/operator/counter/types/counter.types";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ResultsList from "@/components/search/ResultsList";
import { Loader2 } from "lucide-react";

export interface FilterState {
  busType: string[];
  isAC: boolean | null;
  priceRange: [number, number];
  amenities: string[];
  departureTime: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userProfile } = useUserAuth();
  const { setSearchInfo, selectBusAndSeats } = useBooking();

  const [buses, setBuses] = useState<IBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    busType: [],
    isAC: null,
    priceRange: [0, 5000],
    amenities: [],
    departureTime: [],
  });

  const busService = useMemo(() => new BusService(), []);

  const from = searchParams.get("from") || "";
  const to   = searchParams.get("to")   || "";
  const date = searchParams.get("date") || "";

  // Persist search info into BookingContext so downstream pages can read it
  useEffect(() => {
    if (from && to && date) setSearchInfo(from, to, date);
  }, [from, to, date, setSearchInfo]);

  useEffect(() => {
    if (!from || !to || !date) return;
    setLoading(true);
    setError(null);
    busService.searchAllBuses(from, to, date)
      .then((results) => setBuses(results))
      .catch(() => setError("Failed to search buses. Please try again."))
      .finally(() => setLoading(false));
  }, [from, to, date, busService]);

  const handleSelectSeats = (bus: IBus, seats: string[]) => {
    selectBusAndSeats(bus, seats);
    router.push("/booking/passenger-details");
  };

  return (
    <div className="min-h-screen bg-primary/5 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <SearchBar defaultFrom={from} defaultTo={to} defaultDate={date} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-1/4">
            <Filters filters={filters} onFiltersChange={setFilters} buses={buses} />
          </div>

          <ResultsList
            buses={buses}
            loading={loading}
            error={error}
            onSelectSeats={handleSelectSeats}
            filters={filters}
            currentUser={userProfile}
            searchDate={date}
          />
        </div>
      </div>
    </div>
  );
}
