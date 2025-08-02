// app/search/page.tsx 
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BusService } from "@/components/operator/counter/services/bus.service";
import { useUserAuth } from "@/contexts/user-auth-context";
import type { IBus } from "@/components/operator/counter/types/counter.types";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ResultsList from "@/components/search/ResultsList";
import { Loader2 } from "lucide-react";
import { 
  collection, 
  addDoc, 
  serverTimestamp 
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

  const busService = new BusService();

  // Get search parameters from URL
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const date = searchParams.get("date") || "";

  // Search for buses
  const searchBuses = async () => {
    if (!from || !to || !date) return;
    
    setLoading(true);
    setError(null);
    try {
      const results = await busService.searchAllBuses(from, to, date);
      setBuses(results);
      setFilteredBuses(results);
    } catch (error) {
      console.error("Error searching buses:", error);
      setError("Failed to search buses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to buses
  const applyFilters = () => {
    let filtered = [...buses];

    // Bus type filter (Micro, Deluxe, etc.)
    if (filters.busType.length > 0) {
      filtered = filtered.filter(bus => 
        filters.busType.includes(bus.type)
      );
    }

    // AC filter
    if (filters.isAC !== null) {
      filtered = filtered.filter(bus => bus.isAC === filters.isAC);
    }

    // Price range filter
    filtered = filtered.filter(bus => 
      bus.price >= filters.priceRange[0] && bus.price <= filters.priceRange[1]
    );

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(bus => 
        filters.amenities.every(amenity => 
          bus.amenities && bus.amenities.includes(amenity)
        )
      );
    }

    // Departure time filter
    if (filters.departureTime.length > 0) {
      filtered = filtered.filter(bus => {
        const hour = parseInt(bus.departureTime.split(':')[0]);
        const isDayTime = hour < 12;
        
        return filters.departureTime.some(timeFilter => {
          if (timeFilter === 'day' && isDayTime) return true;
          if (timeFilter === 'night' && !isDayTime) return true;
          return false;
        });
      });
    }

    setFilteredBuses(filtered);
  };

  // Handle booking confirmation
  const handleBookingConfirm = async (bookingData: {
    busId: string;
    passengerName: string;
    passengerPhone: string;
    seatNumber: string;
    totalPrice: number;
    boardingPoint?: string;
    droppingPoint?: string;
  }) => {
    try {
      const selectedBus = buses.find(bus => bus.id === bookingData.busId);
      if (!selectedBus) {
        throw new Error("Bus not found");
      }

      // Create booking in activeBookings collection
      const activeBookingData = {
        operatorId: selectedBus.operatorId || "",
        userId: userProfile?.uid || "",
        busId: selectedBus.id,
        busName: selectedBus.name,
        busType: selectedBus.type,
        from: from,
        to: to,
        date: date, // Use the search date for booking
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

      // Add to Firestore activeBookings collection
      const docRef = await addDoc(collection(firestore, "activeBookings"), activeBookingData);
      
      // Success feedback
      alert(`Booking confirmed! Booking ID: ${docRef.id}\nPassenger: ${bookingData.passengerName}\nSeat: ${bookingData.seatNumber}${userProfile ? `\n(Linked to account: ${userProfile.email})` : ''}`);
      
      // Refresh the page to update booked seats
      window.location.reload();
      
    } catch (error) {
      console.error("Booking error:", error);
      throw new Error(error instanceof Error ? error.message : "Booking failed. Please try again.");
    }
  };

  useEffect(() => {
    searchBuses();
  }, [from, to, date]);

  useEffect(() => {
    applyFilters();
  }, [filters, buses]);

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f2e7e7 ' }}>
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Searching for buses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f2e7e7 ' }}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                <span className="text-blue-600">uth</span>
                <span className="text-red-600">bus</span>
                <span className="text-xs text-gray-500 ml-1 bg-gray-200 px-1 rounded">BETA</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar defaultFrom={from} defaultTo={to} defaultDate={date} />
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <Filters 
              filters={filters} 
              onFiltersChange={handleFiltersChange}
              buses={buses}
            />
          </div>
          
          {/* Results List - Pass search date */}
          <ResultsList 
            buses={filteredBuses} 
            loading={loading}
            error={error}
            onBookBus={handleBookingConfirm}
            filters={filters}
            currentUser={userProfile}
            searchDate={date} // Pass the search date
          />
        </div>
      </div>
    </div>
  );
}