'use client';

import { useState, useEffect } from 'react';
import { Filter, X } from 'lucide-react';
import type { IBus } from "@/components/operator/counter/types/counter.types";

export interface FilterState {
  busType: string;
  priceRange: [number, number];
  amenities: string[];
}

interface FiltersProps {
  filters?: FilterState; // ← ADD THIS
  onFiltersChange: (filters: FilterState) => void;
  initialFilters?: FilterState;
  maxPrice?: number;
  availableAmenities?: string[];
  buses?: IBus[];
}


const DEFAULT_AMENITIES = [
  'WiFi',
  'AC',
  'Blanket',
  'Pillow',
  'Charging Port',
  'Entertainment',
  'Snacks',
  'Water Bottle',
  'Rest Stops'
];

export default function Filters({ 
  onFiltersChange, 
  initialFilters,
  maxPrice = 5000,
  availableAmenities = DEFAULT_AMENITIES
}: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    busType: 'All',
    priceRange: [0, maxPrice],
    amenities: [],
    ...initialFilters
  });

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleBusTypeChange = (type: string) => {
    setFilters(prev => ({
      ...prev,
      busType: type
    }));
  };

  const handlePriceRangeChange = (range: [number, number]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: range
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const clearFilters = () => {
    setFilters({
      busType: 'All',
      priceRange: [0, maxPrice],
      amenities: []
    });
  };

  const hasActiveFilters = filters.busType !== 'All' || 
                          filters.priceRange[0] !== 0 || 
                          filters.priceRange[1] !== maxPrice || 
                          filters.amenities.length > 0;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`
        fixed inset-0 z-50 bg-black bg-opacity-50 lg:static lg:bg-transparent lg:z-auto
        ${isOpen ? 'block' : 'hidden lg:block'}
      `}>
        <div className={`
          fixed right-0 top-0 h-full w-80 bg-white shadow-xl lg:static lg:w-full lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
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

            {/* Bus Type Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Bus Type</h4>
              <div className="space-y-2">
                {['All', 'AC', 'Non-AC'].map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="busType"
                      value={type}
                      checked={filters.busType === type}
                      onChange={(e) => handleBusTypeChange(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Min</label>
                    <input
                      type="number"
                      value={filters.priceRange[0]}
                      onChange={(e) => handlePriceRangeChange([
                        parseInt(e.target.value) || 0,
                        filters.priceRange[1]
                      ])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max={maxPrice}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Max</label>
                    <input
                      type="number"
                      value={filters.priceRange[1]}
                      onChange={(e) => handlePriceRangeChange([
                        filters.priceRange[0],
                        parseInt(e.target.value) || maxPrice
                      ])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                      max={maxPrice}
                    />
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange([
                      parseInt(e.target.value),
                      filters.priceRange[1]
                    ])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange([
                      filters.priceRange[0],
                      parseInt(e.target.value)
                    ])}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb absolute top-0"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>NPR {filters.priceRange[0]}</span>
                  <span>NPR {filters.priceRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Amenities</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {availableAmenities.map((amenity) => (
                  <label key={amenity} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom slider styles */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #2563eb;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </>
  );
}