'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, RefreshCw, MapPin, Edit, X, ArrowRight } from 'lucide-react';
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
  const [showMobileModal, setShowMobileModal] = useState(false);

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
    await performSearch(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // Auto-search when date is changed and we have from/to cities
    if (field === 'date' && newFormData.from && newFormData.to && value) {
      performSearch(newFormData);
    }
  };

  const performSearch = async (searchData: typeof formData) => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Update URL with search params
      const params = new URLSearchParams();
      params.set('from', searchData.from);
      params.set('to', searchData.to);
      params.set('date', searchData.date);
      
      router.push(`/search?${params.toString()}`);
      
      // Call onSearch callback if provided
      if (onSearch) {
        onSearch(searchData);
      }
      
      // Close modal on mobile after search
      setShowMobileModal(false);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      });
    }
  };

  // Compact mobile summary view
  const MobileSummaryView = () => (
    <div 
      className="md:hidden bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer"
      onClick={() => setShowMobileModal(true)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Cities on one line */}
          <div className="flex items-center text-lg font-semibold text-gray-900">
            <span>{formData.from || 'From'}</span>
            <ArrowRight className="w-4 h-4 mx-2 text-gray-400" />
            <span>{formData.to || 'To'}</span>
          </div>
          {/* Date on second line */}
          <div className="text-sm text-gray-600 mt-1">
            {formatDate(formData.date)}
          </div>
        </div>
        <div className="ml-4">
          <Edit className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );

  // Mobile modal
  const MobileModal = () => (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setShowMobileModal(false)}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Search for Buses</h2>
            <button
              onClick={() => setShowMobileModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* From and To Locations with overlapping swap button */}
            <div className="space-y-2 relative">
              {/* From Location */}
              <div className="relative">
                <div className="border border-gray-300 rounded-lg px-4 pr-12 py-4 bg-white">
                  <div className="text-xs text-gray-500 font-medium mb-1">From</div>
                  <CitySelect
                    value={formData.from}
                    onChange={(value) => handleInputChange('from', value)}
                    placeholder="Kathmandu"
                    label=""
                  />
                </div>
              </div>

              {/* To Location */}
              <div className="relative">
                <div className="border border-gray-300 rounded-lg px-4 pr-12 py-4 bg-white">
                  <div className="text-xs text-gray-500 font-medium mb-1">To</div>
                  <CitySelect
                    value={formData.to}
                    onChange={(value) => handleInputChange('to', value)}
                    placeholder="Biratnagar"
                    label=""
                  />
                </div>
              </div>

              {/* Swap Button - Overlapping at the right edge */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-10">
                <button
                  type="button"
                  onClick={swapLocations}
                  className="p-2.5 bg-red-500 text-white hover:bg-red-600 rounded-full transition-colors shadow-md"
                  title="Swap locations"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="border border-gray-300 rounded-lg px-4 py-4">
              <div className="text-xs text-gray-500 font-medium mb-1">Journey Date</div>
              <DatePicker
                value={formData.date}
                onChange={(value) => handleInputChange('date', value)}
              />
            </div>

            {/* Search Button - Full width */}
            <button
              type="submit"
              disabled={isLoading || !formData.from || !formData.to || !formData.date}
              className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-6 py-4 rounded-lg font-semibold transition-colors text-base"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search Buses
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center">
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
        </form>
      </div>

      {/* Mobile Summary View */}
      <MobileSummaryView />

      {/* Mobile Modal */}
      {showMobileModal && <MobileModal />}
    </>
  );
}