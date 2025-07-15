// app/search/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BusService } from "@/components/operator/counter/services/bus.service";
import type { IBus } from "@/components/operator/counter/types/counter.types";
import SearchBar from "@/components/search/SearchBar";
import Filters from "@/components/search/Filters";
import ResultsList from "@/components/search/ResultsList";
import { Loader2 } from "lucide-react";

export interface FilterState {
  busType: string; // "All" | "AC" | "Non-AC"
  priceRange: [number, number];
  amenities: string[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [buses, setBuses] = useState<IBus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<IBus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    busType: "All",
    priceRange: [0, 5000],
    amenities: [],
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
    try {
      const results = await busService.searchAllBuses(from, to, date);
      setBuses(results);
      setFilteredBuses(results);
    } catch (error) {
      console.error("Error searching buses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to buses
  const applyFilters = () => {
    let filtered = [...buses];

    // Bus type filter
    if (filters.busType !== "All") {
      filtered = filtered.filter(bus => bus.type === filters.busType);
    }

    // Price range filter
    filtered = filtered.filter(bus => 
      bus.price >= filters.priceRange[0] && bus.price <= filters.priceRange[1]
    );

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter(bus => 
        filters.amenities.every(amenity => bus.amenities.includes(amenity))
      );
    }

    setFilteredBuses(filtered);
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
            <ResultsList buses={filteredBuses} from={from} to={to} date={date} />
          </div>
        </div>
      </div>
    </div>
  );
}