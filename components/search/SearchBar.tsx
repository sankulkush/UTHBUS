'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, RefreshCw, Edit, X, ArrowRight } from 'lucide-react';
import CitySelect from '@/components/city-select';
import DatePicker from '@/components/date-picker';

interface SearchBarProps {
  onSearch?: (searchData: { from: string; to: string; date: string }) => void;
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
    date: defaultDate || new Date().toISOString().split('T')[0],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);

  useEffect(() => {
    const fromParam = searchParams.get('from') || '';
    const toParam   = searchParams.get('to')   || '';
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];
    setFormData({ from: fromParam, to: toParam, date: dateParam });
  }, [searchParams]);

  const performSearch = async (data: typeof formData) => {
    if (!data.from || !data.to || !data.date) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('from', data.from);
      params.set('to',   data.to);
      params.set('date', data.date);
      router.push(`/search?${params.toString()}`);
      if (onSearch) onSearch(data);
      setShowMobileModal(false);
    } catch (e) {
      console.error('Search error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    const next = { ...formData, [field]: value };
    setFormData(next);
    if (field === 'date' && next.from && next.to && value) performSearch(next);
  };

  const swapLocations = () =>
    setFormData((p) => ({ ...p, from: p.to, to: p.from }));

  const formatDate = (ds: string) => {
    const d = new Date(ds);
    const today    = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === today.toDateString())    return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      {/* ── Desktop ── */}
      <div className="hidden md:block bg-card rounded-xl shadow-soft border border-border overflow-hidden">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center">
            {/* From */}
            <div className="flex-1 border-r border-border px-4 py-3">
              <CitySelect
                value={formData.from}
                onChange={(v) => handleInputChange('from', v)}
                placeholder="From"
                label="FROM"
              />
            </div>

            {/* Swap */}
            <div className="px-3 shrink-0">
              <button
                type="button"
                onClick={swapLocations}
                className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                title="Swap locations"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>

            {/* To */}
            <div className="flex-1 border-r border-border px-4 py-3">
              <CitySelect
                value={formData.to}
                onChange={(v) => handleInputChange('to', v)}
                placeholder="To"
                label="TO"
              />
            </div>

            {/* Date */}
            <div className="flex-1 border-r border-border px-4 py-1">
              <DatePicker
                value={formData.date}
                onChange={(v) => handleInputChange('date', v)}
              />
            </div>

            {/* Search button */}
            <div className="px-4 shrink-0">
              <button
                type="submit"
                disabled={isLoading || !formData.from || !formData.to || !formData.date}
                className="flex items-center gap-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground px-6 lg:px-8 py-4 rounded-lg font-semibold transition-all min-w-[120px] lg:min-w-[140px] justify-center text-sm uppercase tracking-wide"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent" />
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

      {/* ── Mobile summary ── */}
      <div
        className="md:hidden bg-card rounded-xl shadow-soft border border-border p-4 cursor-pointer"
        onClick={() => setShowMobileModal(true)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center text-base font-semibold text-foreground">
              <span className="truncate">{formData.from || 'From'}</span>
              <ArrowRight className="w-4 h-4 mx-2 text-muted-foreground shrink-0" />
              <span className="truncate">{formData.to || 'To'}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{formatDate(formData.date)}</p>
          </div>
          <Edit className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
        </div>
      </div>

      {/* ── Mobile modal ── */}
      {showMobileModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setShowMobileModal(false)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">Search for Buses</h2>
                <button
                  onClick={() => setShowMobileModal(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
                <div className="space-y-2 relative">
                  <div className="border border-border rounded-xl px-4 py-3 bg-background">
                    <p className="text-xs text-muted-foreground font-medium mb-1">From</p>
                    <CitySelect
                      value={formData.from}
                      onChange={(v) => handleInputChange('from', v)}
                      placeholder="Kathmandu"
                      label=""
                    />
                  </div>
                  <div className="border border-border rounded-xl px-4 py-3 bg-background">
                    <p className="text-xs text-muted-foreground font-medium mb-1">To</p>
                    <CitySelect
                      value={formData.to}
                      onChange={(v) => handleInputChange('to', v)}
                      placeholder="Biratnagar"
                      label=""
                    />
                  </div>
                  {/* Swap button */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">
                    <button
                      type="button"
                      onClick={swapLocations}
                      className="p-2.5 bg-primary text-primary-foreground rounded-full transition-colors shadow-md hover:opacity-90"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border border-border rounded-xl px-4 py-3 bg-background">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Journey Date</p>
                  <DatePicker
                    value={formData.date}
                    onChange={(v) => handleInputChange('date', v)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !formData.from || !formData.to || !formData.date}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground px-6 py-4 rounded-xl font-semibold transition-all text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-foreground border-t-transparent" />
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
      )}
    </>
  );
}
