// app/search/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { BusService } from "@/components/operator/counter/services/bus.service";
import { useUserAuth } from "@/contexts/user-auth-context";
import type { IBus } from "@/components/operator/counter/types/counter.types";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ResultsList from "@/components/search/ResultsList";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export interface FilterState {
  busType: string[];
  isAC: boolean | null;
  priceRange: [number, number];
  amenities: string[];
  departureTime: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { userProfile } = useUserAuth();
  const [buses, setBuses] = useState<IBus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<IBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    busType: [],
    isAC: null,
    priceRange: [0, 5000],
    amenities: [],
    departureTime: [],
  });

  // Memoized service — never re-instantiated on each render
  const busService = useMemo(() => new BusService(), []);

  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  const searchBuses = async () => {
    if (!from || !to || !date) return;
    setLoading(true);
    setError(null);
    try {
      const results = await busService.searchAllBuses(from, to, date);
      setBuses(results);
      setFilteredBuses(results);
    } catch (err) {
      console.error("Error searching buses:", err);
      setError("Failed to search buses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...buses];

    if (filters.busType.length > 0) {
      filtered = filtered.filter((bus) => filters.busType.includes(bus.type));
    }
    if (filters.isAC !== null) {
      filtered = filtered.filter((bus) => bus.isAC === filters.isAC);
    }
    filtered = filtered.filter(
      (bus) =>
        bus.price >= filters.priceRange[0] && bus.price <= filters.priceRange[1]
    );
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((bus) =>
        filters.amenities.every(
          (amenity) => bus.amenities && bus.amenities.includes(amenity)
        )
      );
    }
    if (filters.departureTime.length > 0) {
      filtered = filtered.filter((bus) => {
        const hour = parseInt(bus.departureTime.split(":")[0]);
        const isDayTime = hour < 12;
        return filters.departureTime.some((timeFilter) => {
          if (timeFilter === "day" && isDayTime) return true;
          if (timeFilter === "night" && !isDayTime) return true;
          return false;
        });
      });
    }

    setFilteredBuses(filtered);
  };

  const handleBookingConfirm = async (bookingData: {
    busId: string;
    passengerName: string;
    passengerPhone: string;
    seatNumber: string;
    totalPrice: number;
    boardingPoint?: string;
    droppingPoint?: string;
  }) => {
    const selectedBus = buses.find((bus) => bus.id === bookingData.busId);
    if (!selectedBus) throw new Error("Bus not found");

    const activeBookingData = {
      operatorId: selectedBus.operatorId || "",
      userId: userProfile?.uid || "",
      busId: selectedBus.id,
      busName: selectedBus.name,
      busType: selectedBus.type,
      from,
      to,
      date,
      time: selectedBus.departureTime,
      seatNumber: bookingData.seatNumber,
      passengerName: bookingData.passengerName,
      passengerPhone: bookingData.passengerPhone,
      boardingPoint: bookingData.boardingPoint || "",
      droppingPoint: bookingData.droppingPoint || "",
      amount: bookingData.totalPrice,
      status: "booked",
      bookingTime: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(firestore, "activeBookings"),
      activeBookingData
    );

    toast.success("Booking confirmed!", {
      description: `Seat ${bookingData.seatNumber} · Booking ID: ${docRef.id.slice(0, 8).toUpperCase()}`,
      duration: 6000,
    });

    // Refresh buses list without full page reload
    await searchBuses();
  };

  useEffect(() => {
    searchBuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, date]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, buses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-16">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Searching for buses…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar defaultFrom={from} defaultTo={to} defaultDate={date} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters */}
          <div className="lg:w-1/4">
            <Filters
              filters={filters}
              onFiltersChange={setFilters}
              buses={buses}
            />
          </div>

          {/* Results */}
          <ResultsList
            buses={filteredBuses}
            loading={loading}
            error={error}
            onBookBus={handleBookingConfirm}
            filters={filters}
            currentUser={userProfile}
            searchDate={date}
          />
        </div>
      </div>
    </div>
  );
}
