// app/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BusService } from "@/components/operator/counter/services/bus.service";
import { ActiveBookingsService } from "@/components/operator/counter/services/active-booking.service";
import type { IBus } from "@/components/operator/counter/types/counter.types";
import type { IActiveBooking } from "@/components/operator/counter/services/active-booking.service";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ResultsList from "@/components/search/ResultsList";
import BookingModal from "@/components/search/BookingModal";
import { Loader2 } from "lucide-react";
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export interface FilterState {
  busType: string[]; // Changed from single string to array for multiple selections
  isAC: boolean | null; // null means "All", true means AC only, false means Non-AC only
  priceRange: [number, number];
  amenities: string[];
  departureTime: string[]; // "day" | "night"
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<IBus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<IBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookedSeats, setBookedSeats] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    busType: [],
    isAC: null,
    priceRange: [0, 5000],
    amenities: [],
    departureTime: [],
  });

  const busService = new BusService();
  const activeBookingsService = new ActiveBookingsService();

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

  // Get booked seats for the selected bus
  const getBookedSeats = async (busId: string) => {
    try {
      const seats = await activeBookingsService.getBookedSeats(busId, date);
      setBookedSeats(seats);
    } catch (error) {
      console.error("Error fetching booked seats:", error);
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

  // Handle bus booking
  const handleBookBus = async (bus: IBus) => {
    setSelectedBus(bus);
    await getBookedSeats(bus.id);
    setIsBookingModalOpen(true);
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
      if (!selectedBus) {
        throw new Error("No bus selected");
      }

      // Check if seat is available
      const seatAvailable = await activeBookingsService.isSeatAvailable(
        bookingData.busId, 
        date, 
        bookingData.seatNumber
      );
      
      if (!seatAvailable) {
        throw new Error("This seat is no longer available. Please select another seat.");
      }

      // Create booking in activeBookings collection
      const activeBookingData: Omit<IActiveBooking, "id"> = {
        operatorId: selectedBus.operatorId || "",
        userId: "",
        busId: selectedBus.id,
        busName: selectedBus.name,
        busType: selectedBus.type,
        from: from,
        to: to,
        date: date,
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
      alert(`Booking confirmed! Booking ID: ${docRef.id}\nPassenger: ${bookingData.passengerName}\nSeat: ${bookingData.seatNumber}`);
      
      // Close modal and refresh booked seats
      setIsBookingModalOpen(false);
      setSelectedBus(null);
      
      // Refresh booked seats for this bus
      await getBookedSeats(selectedBus.id);
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Searching for buses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

          {/* Results */}
          <div className="lg:w-3/4">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {filteredBuses.length} buses found from {from} to {to}
              </h2>
              <p className="text-sm text-gray-600">
                Departure date: {new Date(date).toLocaleDateString()}
              </p>
            </div>
            
            <ResultsList 
              buses={filteredBuses} 
              loading={loading}
              error={error}
              onBookBus={handleBookBus}
              filters={filters}
            />
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {selectedBus && (
        <BookingModal
          bus={selectedBus}
          bookedSeats={bookedSeats}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedBus(null);
          }}
          onConfirm={handleBookingConfirm}
        />
      )}
    </div>
  );
}