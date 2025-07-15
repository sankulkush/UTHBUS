'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Calendar } from 'lucide-react';

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
    date: defaultDate
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialize form data from URL params
  useEffect(() => {
    const fromParam = searchParams.get('from') || '';
    const toParam = searchParams.get('to') || '';
    const dateParam = searchParams.get('date') || '';
    
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

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* From Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                placeholder="Departure city"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>

          {/* To Location */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                placeholder="Destination city"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
              <button
                type="button"
                onClick={swapLocations}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors"
                title="Swap locations"
              >
                ⇄
              </button>
            </div>
          </div>

          {/* Date */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                min={today}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !formData.from || !formData.to || !formData.date}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors min-w-[150px] justify-center"
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