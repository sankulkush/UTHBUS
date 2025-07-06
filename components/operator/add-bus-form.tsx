// components/operator/add-bus-form.tsx
'use client';

import React, { useState } from 'react';
import { addBus, updateOperatorBusCount } from '@/lib/database-service';

interface AddBusFormProps {
  operatorId: string;
  operatorName: string;
  onBusAdded: (busId: string) => void;
  onClose: () => void;
}

interface FormData {
  busNumber: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  fare: string;
  totalSeats: string;
  busType: string;
  amenities: string[];
}

const AddBusForm: React.FC<AddBusFormProps> = ({ 
  operatorId, 
  operatorName, 
  onBusAdded, 
  onClose 
}) => {
  const [formData, setFormData] = useState<FormData>({
    busNumber: '',
    originCity: '',
    destinationCity: '',
    departureTime: '',
    arrivalTime: '',
    fare: '',
    totalSeats: '',
    busType: 'AC',
    amenities: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, value]
        : prev.amenities.filter(amenity => amenity !== value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const busData = {
        operatorId,
        operatorName,
        busNumber: formData.busNumber,
        originCity: formData.originCity,
        destinationCity: formData.destinationCity,
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        fare: parseFloat(formData.fare),
        totalSeats: parseInt(formData.totalSeats),
        availableSeats: parseInt(formData.totalSeats),
        busType: formData.busType,
        amenities: formData.amenities
      };

      const busId = await addBus(busData);
      await updateOperatorBusCount(operatorId, true);
      
      alert('Bus added successfully!');
      onBusAdded(busId);
      onClose();
    } catch (err) {
      setError('Failed to add bus. Please try again.');
      console.error('Error adding bus:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add New Bus</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bus Number</label>
            <input
              type="text"
              name="busNumber"
              value={formData.busNumber}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., GreenLine 003"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Origin City</label>
            <input
              type="text"
              name="originCity"
              value={formData.originCity}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Delhi"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Destination City</label>
            <input
              type="text"
              name="destinationCity"
              value={formData.destinationCity}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Mumbai"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Departure Time</label>
              <input
                type="time"
                name="departureTime"
                value={formData.departureTime}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Arrival Time</label>
              <input
                type="time"
                name="arrivalTime"
                value={formData.arrivalTime}
                onChange={handleChange}
                required
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fare (₹)</label>
              <input
                type="number"
                name="fare"
                value={formData.fare}
                onChange={handleChange}
                required
                min="0"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Total Seats</label>
              <input
                type="number"
                name="totalSeats"
                value={formData.totalSeats}
                onChange={handleChange}
                required
                min="1"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bus Type</label>
            <select
              name="busType"
              value={formData.busType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AC">AC</option>
              <option value="Non-AC">Non-AC</option>
              <option value="Sleeper">Sleeper</option>
              <option value="Semi-Sleeper">Semi-Sleeper</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              {['WiFi', 'Charging Port', 'Water Bottle', 'Blanket', 'Pillow', 'Entertainment'].map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    value={amenity}
                    onChange={handleAmenityChange}
                    className="mr-2"
                  />
                  <span className="text-sm">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Adding...' : 'Add Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusForm;