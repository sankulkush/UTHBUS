'use client';

import { Clock, MapPin, Users, Star } from 'lucide-react';
import type { IBus } from "@/components/operator/counter/types/counter.types";


interface BusCardProps {
  bus: IBus;
  onBook: () => void;
  viewMode?: 'grid' | 'list';
}

export default function BusCard({ bus, onBook, viewMode = 'grid' }: BusCardProps) {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = (departure: string, arrival: string) => {
    const depTime = new Date(`2024-01-01T${departure}`);
    const arrTime = new Date(`2024-01-01T${arrival}`);
    
    if (arrTime < depTime) {
      arrTime.setDate(arrTime.getDate() + 1);
    }
    
    const diff = arrTime.getTime() - depTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getBusTypeColor = (type: string) => {
    switch (type) {
      case 'AC':
        return 'bg-blue-100 text-blue-800';
      case 'Non-AC':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const icons: { [key: string]: string } = {
      'WiFi': '📶',
      'AC': '❄️',
      'Blanket': '🛏️',
      'Pillow': '🛏️',
      'Charging Port': '🔌',
      'Entertainment': '🎬',
      'Snacks': '🍪',
      'Water Bottle': '💧',
      'Rest Stops': '🚏'
    };
    return icons[amenity] || '✨';
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Bus Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{bus.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBusTypeColor(bus.type)}`}>
                  {bus.type}
                </span>
              </div>
              
              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{bus.startPoint} → {bus.endPoint}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{bus.seatCapacity} seats</span>
                </div>
              </div>

              {/* Amenities */}
              <div className="flex flex-wrap gap-2">
                {bus.amenities.slice(0, 4).map((amenity) => (
                  <span 
                    key={amenity}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                  >
                    <span>{getAmenityIcon(amenity)}</span>
                    {amenity}
                  </span>
                ))}
                {bus.amenities.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    +{bus.amenities.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Time and Price */}
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{formatTime(bus.departureTime)}</div>
                <div className="text-sm text-gray-500">{bus.startPoint}</div>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">{calculateDuration(bus.departureTime, bus.arrivalTime)}</div>
                <div className="w-16 h-px bg-gray-300"></div>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{formatTime(bus.arrivalTime)}</div>
                <div className="text-sm text-gray-500">{bus.endPoint}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">NPR {bus.price}</div>
                <button
                  onClick={onBook}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">{bus.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBusTypeColor(bus.type)}`}>
              {bus.type}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>4.2</span>
          </div>
        </div>

        {/* Route Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{formatTime(bus.departureTime)}</div>
            <div className="text-sm text-gray-500">{bus.startPoint}</div>
          </div>
          
          <div className="flex flex-col items-center gap-1 flex-1 mx-4">
            <div className="text-xs text-gray-500">{calculateDuration(bus.departureTime, bus.arrivalTime)}</div>
            <div className="w-full h-px bg-gray-300 relative">
              <div className="absolute left-0 top-0 w-2 h-2 bg-green-500 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute right-0 top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2"></div>
            </div>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="text-center">
            <div className="text-xl font-semibold text-gray-900">{formatTime(bus.arrivalTime)}</div>
            <div className="text-sm text-gray-500">{bus.endPoint}</div>
          </div>
        </div>

        {/* Amenities */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {bus.amenities.slice(0, 3).map((amenity) => (
              <span 
                key={amenity}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                <span>{getAmenityIcon(amenity)}</span>
                {amenity}
              </span>
            ))}
            {bus.amenities.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{bus.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{bus.seatCapacity} seats</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">NPR {bus.price}</div>
              <div className="text-xs text-gray-500">per person</div>
            </div>
            <button
              onClick={onBook}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}