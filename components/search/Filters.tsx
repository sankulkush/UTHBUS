'use client';

import { useState, useEffect } from 'react';
import { 
  Filter, 
  X, 
  Snowflake, 
  Wind, 
  Bus, 
  BusFront, 
  Sun, 
  Moon,
  Wifi,
  Zap,
  Armchair,
  Tv,
  Droplet,
  Video
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
  { id: 'Micro', label: 'Micro', icon: Bus },
  { id: 'Deluxe', label: 'Deluxe', icon: BusFront },
];

const AMENITIES = [
  { id: 'Sofa Seat', label: 'Sofa Seat', icon: Armchair },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
  { id: 'charging Point', label: 'Charging Point', icon: Zap },
  { id: 'TV', label: 'TV', icon: Tv },
  { id: 'water', label: 'Water Bottle', icon: Droplet },
  { id: 'cctv', label: 'CCTV', icon: Video },
];

const DEPARTURE_TIMES = [
  { id: 'day', label: 'Day Time', icon: Sun, description: 'Before 12 PM' },
  { id: 'night', label: 'Night Time', icon: Moon, description: 'After 12 PM' },
];

export default function Filters({ 
  filters,
  onFiltersChange, 
  buses = []
}: FiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lastMaxPrice, setLastMaxPrice] = useState(0);

  // Calculate max price from buses and set it as default max
  const maxPrice = buses.length > 0 
    ? Math.max(...buses.map(bus => bus.price))
    : 5000;

  // Reset price range when buses change and max price changes
  useEffect(() => {
    if (buses.length > 0 && maxPrice !== lastMaxPrice) {
      // Only reset if the current max in filters is less than the new max price
      // or if this is a significant change in the data set
      const shouldReset = 
        filters.priceRange[1] < maxPrice || 
        lastMaxPrice === 0 || 
        Math.abs(maxPrice - lastMaxPrice) > lastMaxPrice * 0.5; // 50% change threshold
      
      if (shouldReset) {
        onFiltersChange({
          ...filters,
          priceRange: [0, maxPrice]
        });
      }
      
      setLastMaxPrice(maxPrice);
    }
  }, [maxPrice, buses.length, filters, onFiltersChange, lastMaxPrice]);

  const handleBusTypeToggle = (type: string) => {
    const newBusTypes = filters.busType.includes(type)
      ? filters.busType.filter(t => t !== type)
      : [...filters.busType, type];
    
    onFiltersChange({
      ...filters,
      busType: newBusTypes
    });
  };

  const handleACToggle = (isAC: boolean | null) => {
    onFiltersChange({
      ...filters,
      isAC: filters.isAC === isAC ? null : isAC
    });
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange: range
    });
  };

  const handleMinChange = (value: number) => {
    const newMin = Math.min(value, filters.priceRange[1]);
    handlePriceRangeChange([newMin, filters.priceRange[1]]);
  };

  const handleMaxChange = (value: number) => {
    const newMax = Math.max(value, filters.priceRange[0]);
    handlePriceRangeChange([filters.priceRange[0], newMax]);
  };

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity];
    
    onFiltersChange({
      ...filters,
      amenities: newAmenities
    });
  };

  const handleDepartureTimeToggle = (time: string) => {
    const newDepartureTimes = filters.departureTime.includes(time)
      ? filters.departureTime.filter(t => t !== time)
      : [...filters.departureTime, time];
    
    onFiltersChange({
      ...filters,
      departureTime: newDepartureTimes
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      busType: [],
      isAC: null,
      priceRange: [0, maxPrice],
      amenities: [],
      departureTime: []
    });
  };

  const hasActiveFilters = 
    filters.busType.length > 0 || 
    filters.isAC !== null ||
    filters.priceRange[0] !== 0 || 
    filters.priceRange[1] !== maxPrice || 
    filters.amenities.length > 0 ||
    filters.departureTime.length > 0;

  // Calculate percentages for dual range slider - ensure they stay within bounds
  const minPercent = Math.max(0, Math.min(100, (filters.priceRange[0] / maxPrice) * 100));
  const maxPercent = Math.max(0, Math.min(100, (filters.priceRange[1] / maxPrice) * 100));

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div 
        className={`
          fixed inset-0 z-50 bg-black bg-opacity-50 lg:static lg:bg-transparent lg:z-auto
          ${isOpen ? 'block' : 'hidden lg:block'}
        `}
        onClick={() => setIsOpen(false)}
      >
        <div 
          className={`
            fixed right-0 top-0 h-full w-80 bg-white shadow-xl lg:static lg:w-full lg:shadow-lg lg:rounded-xl lg:border lg:border-gray-200
            transform transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AC/Non-AC Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Air Conditioning</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleACToggle(true)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                    filters.isAC === true
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Snowflake className="w-4 h-4" />
                  <span className="text-sm">AC</span>
                </button>
                <button
                  onClick={() => handleACToggle(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                    filters.isAC === false
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Wind className="w-4 h-4" />
                  <span className="text-sm">Non-AC</span>
                </button>
              </div>
            </div>

            {/* Bus Type Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Bus Type</h4>
              <div className="flex flex-wrap gap-2">
                {BUS_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleBusTypeToggle(type.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                        filters.busType.includes(type.id)
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Departure Time Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Departure Time</h4>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDepartureTimeToggle('day')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                    filters.departureTime.includes('day')
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Day
                </button>
                <button
                  onClick={() => handleDepartureTimeToggle('night')}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
                    filters.departureTime.includes('night')
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Night
                </button>
              </div>
            </div>

            {/* Price Range Filter - Fixed */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-4">
                {/* Dual Range Slider */}
                <div className="relative h-6 flex items-center">
                  {/* Track background */}
                  <div className="absolute w-full h-1 bg-gray-200 rounded-lg"></div>
                  
                  {/* Active track between thumbs */}
                  <div
                    className="absolute h-1 bg-red-500 rounded-lg"
                    style={{
                      left: `${minPercent}%`,
                      width: `${Math.max(0, maxPercent - minPercent)}%`
                    }}
                  ></div>
                  
                  {/* Min range input */}
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={Math.min(filters.priceRange[0], maxPrice)}
                    onChange={(e) => handleMinChange(parseInt(e.target.value))}
                    className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-10 dual-range-slider"
                  />
                  
                  {/* Max range input */}
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={Math.min(filters.priceRange[1], maxPrice)}
                    onChange={(e) => handleMaxChange(parseInt(e.target.value))}
                    className="absolute w-full h-1 bg-transparent appearance-none cursor-pointer z-20 dual-range-slider"
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>NPR {Math.min(filters.priceRange[0], maxPrice).toLocaleString()}</span>
                  <span>NPR {Math.min(filters.priceRange[1], maxPrice).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Amenities Filter - Updated to square layout */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Amenities</h4>
              <div className="grid grid-cols-3 gap-2">
                {AMENITIES.map((amenity) => {
                  const Icon = amenity.icon;
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => handleAmenityToggle(amenity.id)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                        filters.amenities.includes(amenity.id)
                          ? 'bg-red-50 border-red-500 text-red-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs text-center leading-tight">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .dual-range-slider {
          pointer-events: none;
        }
        
        .dual-range-slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #ef4444;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          pointer-events: auto;
        }
        
        .dual-range-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #ef4444;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          pointer-events: auto;
        }
        
        .dual-range-slider::-webkit-slider-thumb:hover {
          border-color: #dc2626;
        }
        
        .dual-range-slider::-moz-range-thumb:hover {
          border-color: #dc2626;
        }
      `}</style>
    </>
  );
}