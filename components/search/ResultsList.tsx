// REPLACE your entire ResultsList component with this fixed version

'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { SortAsc, SortDesc } from 'lucide-react';
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
type SortOrder = 'asc' | 'desc';

export default function ResultsList({ 
  buses, 
  loading, 
  error, 
  onBookBus,
  filters,
  currentUser,
  searchDate
}: ResultsListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('departure');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [bookedSeatsMap, setBookedSeatsMap] = useState<{ [busId: string]: string[] }>({});
  const [seatCheckLoading, setSeatCheckLoading] = useState(false);
  
  // FIX: Create service instance only once using useMemo
  const activeBookingsService = useMemo(() => new ActiveBookingsService(), []);
  
  // FIX: Memoize the date to prevent recreating
  const travelDate = useMemo(() => 
    searchDate || new Date().toISOString().split('T')[0], 
    [searchDate]
  );
  
  const calculateDuration = useCallback((departure: string, arrival: string) => {
    const depTime = new Date(`2024-01-01T${departure}`);
    const arrTime = new Date(`2024-01-01T${arrival}`);
    
    if (arrTime < depTime) {
      arrTime.setDate(arrTime.getDate() + 1);
    }
    
    return arrTime.getTime() - depTime.getTime();
  }, []);

  // FIX: Load booked seats only when buses or date changes, not on every render
  useEffect(() => {
    let isMounted = true;
    
    const loadBookedSeats = async () => {
      if (buses.length === 0) return;
      
      setSeatCheckLoading(true);
      const bookedSeatsData: { [busId: string]: string[] } = {};
      
      try {
        await Promise.all(
          buses.map(async (bus) => {
            try {
              const seats = await activeBookingsService.getBookedSeats(bus.id, travelDate);
              if (isMounted) {
                bookedSeatsData[bus.id] = seats;
              }
            } catch (error) {
              console.error(`Error fetching booked seats for bus ${bus.id}:`, error);
              if (isMounted) {
                bookedSeatsData[bus.id] = [];
              }
            }
          })
        );
        
        if (isMounted) {
          setBookedSeatsMap(bookedSeatsData);
        }
      } catch (error) {
        console.error('Error loading booked seats:', error);
      } finally {
        if (isMounted) {
          setSeatCheckLoading(false);
        }
      }
    };

    loadBookedSeats();
    
    return () => {
      isMounted = false;
    };
  }, [buses, travelDate, activeBookingsService]);

  // FIX: Memoize filtered buses to prevent recalculation
  const filteredBuses = useMemo(() => {
    return buses.filter(bus => {
      // Bus type filter
      if (filters.busType.length > 0 && !filters.busType.includes(bus.type)) {
        return false;
      }
      
      // AC filter
      if (filters.isAC !== null && bus.isAC !== filters.isAC) {
        return false;
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
        const isDayTime = departureHour >= 4 && departureHour <= 13;
        const isNightTime = departureHour >= 14 || departureHour < 4;
        
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
  }, [buses, filters]);

  // FIX: Memoize sorted buses
  const sortedBuses = useMemo(() => {
    return [...filteredBuses].sort((a, b) => {
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
  }, [filteredBuses, sortBy, sortOrder, calculateDuration]);

  // FIX: Stable sort handler
  const handleSort = useCallback((option: SortOption) => {
    if (sortBy === option) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(option);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // FIX: Stable booking handler
  const handleBookingWrapper = useCallback(async (bookingData: any) => {
    await onBookBus(bookingData);
    // Reload booked seats after successful booking
    const updatedSeats = await activeBookingsService.getBookedSeats(bookingData.busId, travelDate);
    setBookedSeatsMap(prev => ({
      ...prev,
      [bookingData.busId]: updatedSeats
    }));
  }, [onBookBus, activeBookingsService, travelDate]);

  if (loading) {
    return (
      <div className="lg:w-3/4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
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
      <div className="lg:w-3/4">
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-lg font-medium mb-2">Error Loading Buses</div>
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!sortedBuses.length) {
    return (
      <div className="lg:w-3/4">
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-gray-600 text-lg font-medium mb-2">No buses found</div>
            <p className="text-gray-500 text-sm">
              Try adjusting your search criteria or filters to find available buses.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-3/4 space-y-4">
      {/* Header with results count and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200">
        <div className="text-gray-600">
          <span className="font-medium text-gray-900">{sortedBuses.length}</span> buses found
          {filteredBuses.length !== buses.length && (
            <span className="text-sm text-gray-500 ml-2">
              (filtered from {buses.length})
            </span>
          )}
          {searchDate && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2">
              {new Date(searchDate).toLocaleDateString()}
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
        </div>
      </div>

      {/* Bus Cards - Only list view */}
      <div className="space-y-6">
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