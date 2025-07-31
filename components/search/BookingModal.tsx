// components/search/BookingModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Clock, CreditCard, Check } from 'lucide-react';
import { ActiveBookingsService } from '@/components/operator/counter/services/active-booking.service';
import type { UserProfile } from '@/contexts/user-auth-context';
import type { IBus } from "@/components/operator/counter/types/counter.types"; // USE THE CORRECT IBus TYPE

interface BookingModalProps {
  bus: IBus;
  bookedSeats: string[]; // This should come from the parent component
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (bookingData: {
    busId: string;
    passengerName: string;
    passengerPhone: string;
    seatNumber: string;
    totalPrice: number;
    boardingPoint?: string;
    droppingPoint?: string;
  }) => Promise<void>;
  currentUser?: UserProfile | null; // ADD THIS PROP
}

export default function BookingModal({ bus, bookedSeats, isOpen, onClose, onConfirm, currentUser }: BookingModalProps) {
  const [formData, setFormData] = useState({
    passengerName: '',
    passengerPhone: '',
    seatNumber: '',
    boardingPoint: '',
    droppingPoint: ''
  });
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'seats' | 'details' | 'confirmation'>('seats');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seatCheckLoading, setSeatCheckLoading] = useState(false);

  const activeBookingsService = new ActiveBookingsService();

  // Generate seat layout based on bus capacity and booked seats
  const generateSeats = () => {
    const seats = [];
    const rows = Math.ceil(bus.seatCapacity / 4);
    
    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];
      for (let col = 1; col <= 4; col++) {
        const seatNumber = `${row}${String.fromCharCode(64 + col)}`;
        if (seats.flat().length < bus.seatCapacity) {
          rowSeats.push({
            number: seatNumber,
            available: !bookedSeats.includes(seatNumber), // Check against actual booked seats
            type: col <= 2 ? 'window' : 'aisle'
          });
        }
      }
      if (rowSeats.length > 0) {
        seats.push(rowSeats);
      }
    }
    return seats;
  };

  const seatLayout = generateSeats();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // PRE-FILL USER DATA IF SIGNED IN
      setFormData({
        passengerName: currentUser?.fullName || '',
        passengerPhone: currentUser?.phoneNumber || '',
        seatNumber: '',
        boardingPoint: '',
        droppingPoint: ''
      });
      setSelectedSeats([]);
      setCurrentStep('seats');
      setError('');
    }
  }, [isOpen, currentUser]); // ADD currentUser TO DEPENDENCY ARRAY

  const handleSeatSelect = async (seatNumber: string) => {
    // If seat is already selected, deselect it
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      return;
    }

    // Check if seat is available in real-time
    setSeatCheckLoading(true);
    try {
      const isAvailable = await activeBookingsService.isSeatAvailable(
        bus.id, 
        new Date().toISOString().split('T')[0], // You might need to get the actual date from the search params
        seatNumber
      );
      
      if (!isAvailable) {
        setError('This seat has just been booked by someone else. Please select another seat.');
        setSeatCheckLoading(false);
        return;
      }

      // Limit to 1 seat for this demo
      if (selectedSeats.length < 1) {
        setSelectedSeats([seatNumber]);
      }
    } catch (error) {
      console.error('Error checking seat availability:', error);
      setError('Error checking seat availability. Please try again.');
    } finally {
      setSeatCheckLoading(false);
    }
  };

  const handleNextStep = () => {
    setError(''); // Clear any previous errors
    
    if (currentStep === 'seats' && selectedSeats.length > 0) {
      setFormData(prev => ({ ...prev, seatNumber: selectedSeats[0] }));
      setCurrentStep('details');
    } else if (currentStep === 'details' && formData.passengerName && formData.passengerPhone) {
      setCurrentStep('confirmation');
    }
  };

  const handleConfirmBooking = async () => {
    if (!formData.passengerName || !formData.passengerPhone || !selectedSeats.length) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^(\+?977)?[0-9]{10}$/;
    if (!phoneRegex.test(formData.passengerPhone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Double-check seat availability before booking
      const isAvailable = await activeBookingsService.isSeatAvailable(
        bus.id, 
        new Date().toISOString().split('T')[0], // You might need to get the actual date from the search params
        selectedSeats[0]
      );
      
      if (!isAvailable) {
        throw new Error('This seat is no longer available. Please select another seat.');
      }

      await onConfirm({
        busId: bus.id,
        passengerName: formData.passengerName,
        passengerPhone: formData.passengerPhone,
        seatNumber: selectedSeats[0],
        totalPrice: bus.price * selectedSeats.length,
        boardingPoint: formData.boardingPoint || undefined,
        droppingPoint: formData.droppingPoint || undefined
      });
      
      // Reset form
      setFormData({ 
        passengerName: currentUser?.fullName || '', 
        passengerPhone: currentUser?.phoneNumber || '', 
        seatNumber: '',
        boardingPoint: '',
        droppingPoint: ''
      });
      setSelectedSeats([]);
      setCurrentStep('seats');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return time; // Return original if parsing fails
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Book Your Seat</h2>
            <p className="text-sm text-gray-600">{bus.name} • {bus.startPoint} → {bus.endPoint}</p>
            {/* ADD USER STATUS IN HEADER */}
            {currentUser && (
              <p className="text-xs text-green-600 mt-1">
                ✓ Booking as {currentUser.fullName} ({currentUser.email})
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-center space-x-8">
            {['seats', 'details', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-blue-600 text-white' 
                    : index < ['seats', 'details', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < ['seats', 'details', 'confirmation'].indexOf(currentStep) ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep === step ? 'text-blue-600 font-medium' : 'text-gray-600'
                }`}>
                  {step === 'seats' ? 'Select Seats' : step === 'details' ? 'Passenger Details' : 'Confirmation'}
                </span>
                {index < 2 && <div className="w-12 h-px bg-gray-300 mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {currentStep === 'seats' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select Your Seat</h3>
                <p className="text-sm text-gray-600">Click on an available seat to select it</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-gray-800 text-white px-4 py-2 rounded-t-lg text-sm">Driver</div>
                </div>
                
                <div className="space-y-3">
                  {seatLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-3">
                      {row.map((seat, colIndex) => (
                        <div key={seat.number} className="relative flex">
                          <button
                            onClick={() => seat.available && handleSeatSelect(seat.number)}
                            disabled={!seat.available || seatCheckLoading}
                            className={`w-12 h-12 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedSeats.includes(seat.number)
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : seat.available
                                ? 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {seat.number}
                          </button>
                          {colIndex === 1 && <div className="w-4"></div>}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center gap-6 mt-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-600 border-2 border-blue-600 rounded"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded"></div>
                    <span>Occupied</span>
                  </div>
                </div>
              </div>

              {seatCheckLoading && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                    Checking seat availability...
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 'details' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Passenger Details</h3>
                <p className="text-sm text-gray-600">Enter passenger information for seat {selectedSeats[0]}</p>
                {/* ADD PREFILL NOTICE IF USER IS SIGNED IN */}
                {currentUser && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Details pre-filled from your account
                  </p>
                )}
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.passengerName}
                      onChange={(e) => setFormData(prev => ({ ...prev, passengerName: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="tel"
                      value={formData.passengerPhone}
                      onChange={(e) => setFormData(prev => ({ ...prev, passengerPhone: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boarding Point (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.boardingPoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, boardingPoint: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter boarding point"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dropping Point (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.droppingPoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, droppingPoint: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter dropping point"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 'confirmation' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Confirmation</h3>
                <p className="text-sm text-gray-600">Please review your booking details</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{bus.name}</h4>
                    <p className="text-sm text-gray-600">{bus.startPoint} → {bus.endPoint}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Departure: {formatTime(bus.departureTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Arrival: {formatTime(bus.arrivalTime)}</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Passenger:</span>
                    <span className="text-sm font-medium">{formData.passengerName}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium">{formData.passengerPhone}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Seat:</span>
                    <span className="text-sm font-medium">{selectedSeats[0]}</span>
                  </div>
                  {formData.boardingPoint && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Boarding:</span>
                      <span className="text-sm font-medium">{formData.boardingPoint}</span>
                    </div>
                  )}
                  {formData.droppingPoint && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Dropping:</span>
                      <span className="text-sm font-medium">{formData.droppingPoint}</span>
                    </div>
                  )}
                  {/* ADD ACCOUNT LINKING STATUS */}
                  {currentUser && (
                    <div className="flex justify-between items-center mb-2 bg-green-50 -mx-2 px-2 py-1 rounded">
                      <span className="text-sm text-green-700">Account:</span>
                      <span className="text-sm font-medium text-green-700">✓ Linked to {currentUser.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">NPR {bus.price}</span>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* General Error Display */}
          {error && currentStep !== 'confirmation' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {currentStep === 'seats' && selectedSeats.length > 0 && `Selected: ${selectedSeats[0]}`}
            {currentStep === 'details' && `Seat ${selectedSeats[0]} - NPR ${bus.price}`}
            {currentStep === 'confirmation' && `Total: NPR ${bus.price}`}
          </div>
          
          <div className="flex items-center gap-3">
            {currentStep !== 'seats' && (
              <button
                onClick={() => setCurrentStep(currentStep === 'confirmation' ? 'details' : 'seats')}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            
            {currentStep === 'confirmation' ? (
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Booking...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Confirm Booking
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNextStep}
                disabled={
                  (currentStep === 'seats' && selectedSeats.length === 0) ||
                  (currentStep === 'details' && (!formData.passengerName || !formData.passengerPhone)) ||
                  seatCheckLoading
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {currentStep === 'seats' ? 'Continue' : 'Review Booking'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}