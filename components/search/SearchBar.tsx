'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, RefreshCw } from 'lucide-react';
import CitySelect from '@/components/city-select';
import DatePicker from '@/components/date-picker';

interface SearchBarProps {
  onSearch?: (searchData: {
    from: string;
    to: string;
    date: string;
  }) => void;
  defaultFrom?: string;
  defaultTo?: string;
  defaultDate?: string;
}

export default function SearchBar({
  onSearch,
  defaultFrom = '',
  defaultTo = '',
  defaultDate = '',
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    from: defaultFrom,
    to: defaultTo,
    date: defaultDate || new Date().toISOString().split('T')[0] // Default to today
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data from URL params
  useEffect(() => {
    const fromParam = searchParams.get('from') || '';
    const toParam = searchParams.get('to') || '';
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
    
    setFormData({
      from: fromParam,
      to: toParam,
      date: dateParam
    });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to || !formData.date) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Update URL with search params
      const params = new URLSearchParams();
      params.set('from', formData.from);
      params.set('to', formData.to);
      params.set('date', formData.date);
      
      router.push(`/search?${params.toString()}`);
      
      // Call onSearch callback if provided
      if (onSearch) {
        onSearch(formData);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100">
      <form onSubmit={handleSubmit}>
        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden md:flex items-center">
          {/* From Location */}
          <div className="flex-1 border-r border-gray-200 px-4 py-3">
            <CitySelect
              value={formData.from}
              onChange={(value) => handleInputChange('from', value)}
              placeholder="From"
              label="FROM"
            />
          </div>

          {/* Swap Button */}
          <div className="px-3">
            <button
              type="button"
              onClick={swapLocations}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Swap locations"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          {/* To Location */}
          <div className="flex-1 border-r border-gray-200 px-4 py-3">
            <CitySelect
              value={formData.to}
              onChange={(value) => handleInputChange('to', value)}
              placeholder="To"
              label="TO"
            />
          </div>

          {/* Date */}
          <div className="flex-1 border-r border-gray-200 px-4 py-1">
            <DatePicker
              value={formData.date}
              onChange={(value) => handleInputChange('date', value)}
            />
          </div>

          {/* Search Button */}
          <div className="px-4">
            <button
              type="submit"
              disabled={isLoading || !formData.from || !formData.to || !formData.date}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 lg:px-8 py-4 rounded-lg font-semibold transition-colors min-w-[120px] lg:min-w-[140px] justify-center text-sm uppercase tracking-wide"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span className="hidden lg:inline">Searching...</span>
                  <span className="lg:hidden">...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span className="hidden lg:inline">Search Buses</span>
                  <span className="lg:hidden">Search</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Layout - Stacked vertically */}
        <div className="md:hidden space-y-4 p-4">
          {/* From and To with swap button */}
          <div className="space-y-3">
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <CitySelect
                value={formData.from}
                onChange={(value) => handleInputChange('from', value)}
                placeholder="From"
                label="FROM"
              />
            </div>
            
            {/* Swap Button - Centered */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={swapLocations}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors border border-gray-200"
                title="Swap locations"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg px-3 py-2">
              <CitySelect
                value={formData.to}
                onChange={(value) => handleInputChange('to', value)}
                placeholder="To"
                label="TO"
              />
            </div>
          </div>

          {/* Date */}
          <div className="border border-gray-200 rounded-lg px-3 py-2">
            <DatePicker
              value={formData.date}
              onChange={(value) => handleInputChange('date', value)}
            />
          </div>

          {/* Search Button - Full width on mobile */}
          <button
            type="submit"
            disabled={isLoading || !formData.from || !formData.to || !formData.date}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-semibold transition-colors text-sm uppercase tracking-wide"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Searching...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Search Buses
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}