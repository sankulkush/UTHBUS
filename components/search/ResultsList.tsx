'use client';

import { useState } from 'react';
import { Grid, List, SortAsc, SortDesc } from 'lucide-react';
import BusCard from './BusCard';
import type { IBus } from "@/components/operator/counter/types/counter.types";

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
  onBookBus: (bus: IBus) => void;
  filters: FilterState;
}

type SortOption = 'departure' | 'price' | 'duration';
type SortOrder = 'asc' | 'desc';
type ViewMode = 'grid' | 'list';

export default function ResultsList({ 
  buses, 
  loading, 
  error, 
  onBookBus,
  filters 
}: ResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('departure');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const calculateDuration = (departure: string, arrival: string) => {
    const depTime = new Date(`2024-01-01T${departure}`);
    const arrTime = new Date(`2024-01-01T${arrival}`);
    
    if (arrTime < depTime) {
      arrTime.setDate(arrTime.getDate() + 1);
    }
    
    return arrTime.getTime() - depTime.getTime();
  };

  // Apply filters to buses
  const filteredBuses = buses.filter(bus => {
    // Bus type filter (Micro, Deluxe, etc.)
    if (filters.busType.length > 0) {
      const matchesType = filters.busType.includes(bus.type);
      if (!matchesType) return false;
    }

    // AC filter
    if (filters.isAC !== null) {
      if (filters.isAC && !bus.isAC) return false;
      if (!filters.isAC && bus.isAC) return false;
    }

    // Price range filter
    if (bus.price < filters.priceRange[0] || bus.price > filters.priceRange[1]) {
      return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      const hasAllAmenities = filters.amenities.every(amenity => 
        bus.amenities && bus.amenities.includes(amenity)
      );
      if (!hasAllAmenities) return false;
    }

    // Departure time filter
    if (filters.departureTime.length > 0) {
      const departureHour = parseInt(bus.departureTime.split(':')[0]);
      const isDayTime = departureHour >= 4 && departureHour <= 13; // 4 AM to 1 PM
      const isNightTime = departureHour >= 14 || departureHour < 4; // 2 PM onwards and before 4 AM
      
      let matchesTime = false;
      
      if (filters.departureTime.includes('day') && isDayTime) {
        matchesTime = true;
      }
      if (filters.departureTime.includes('night') && isNightTime) {
        matchesTime = true;
      }
      
      if (!matchesTime) return false;
    }

    return true;
  });

  const sortedBuses = [...filteredBuses].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'departure':
        comparison = a.departureTime.localeCompare(b.departureTime);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'duration':
        const durationA = calculateDuration(a.departureTime, a.arrivalTime);
        const durationB = calculateDuration(b.departureTime, b.arrivalTime);
        comparison = durationA - durationB;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="h-6 bg-gray-200 rounded w-48"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-14"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-28"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Buses</div>
          <p className="text-red-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!sortedBuses.length) {
    return (
      <div className="text-center py-12">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
          <div className="text-gray-600 text-lg font-medium mb-2">No buses found</div>
          <p className="text-gray-500 text-sm">
            Try adjusting your search criteria or filters to find available buses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with results count and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-gray-600">
          <span className="font-medium text-gray-900">{sortedBuses.length}</span> buses found
          {filteredBuses.length !== buses.length && (
            <span className="text-sm text-gray-500 ml-2">
              (filtered from {buses.length})
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => handleSort('departure')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sortBy === 'departure'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Time
                {sortBy === 'departure' && (
                  sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />
                )}
              </button>
              <button
                onClick={() => handleSort('price')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sortBy === 'price'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Price
                {sortBy === 'price' && (
                  sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />
                )}
              </button>
              <button
                onClick={() => handleSort('duration')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  sortBy === 'duration'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Duration
                {sortBy === 'duration' && (
                  sortOrder === 'asc' ? <SortAsc className="inline w-3 h-3 ml-1" /> : <SortDesc className="inline w-3 h-3 ml-1" />
                )}
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bus Cards */}
      <div className={`
        ${viewMode === 'grid' 
          ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' 
          : 'space-y-4'
        }
      `}>
        {sortedBuses.map((bus) => (
          <BusCard
            key={bus.id}
            bus={bus}
            onBook={() => onBookBus(bus)}
            viewMode={viewMode}
          />
        ))}
      </div>
    </div>
  );
}