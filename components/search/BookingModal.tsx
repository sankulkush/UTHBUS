// components/search/BookingModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { X, Clock, MapPin, Star, Wifi, Snowflake, Monitor, Utensils, Armchair, Users, Phone, User, Check, CreditCard } from 'lucide-react';
import { ActiveBookingsService } from '@/components/operator/counter/services/active-booking.service';
import ComingSoon from '@/components/ComingSoon';
import type { UserProfile } from '@/contexts/user-auth-context';
import type { IBus } from "@/components/operator/counter/types/counter.types";

interface BookingModalProps {
  bus: IBus;
  bookedSeats: string[];
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
  currentUser?: UserProfile | null;
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
  const [activeTab, setActiveTab] = useState<'amenities' | 'rest-stop' | 'reviews' | 'boarding' | 'dropping'>('amenities');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seatCheckLoading, setSeatCheckLoading] = useState(false);
  const activeBookingsService = new ActiveBookingsService();

  // Generate seat layout based on bus type - FIXED for 4 columns with custom numbering
  const generateSeats = () => {
    const seats = [];
    
    if (bus.type === 'Deluxe') {
      // Deluxe bus: 36 seats total (9 rows x 4 seats)
      // Layout: A B | C D (2 columns on left, 2 on right, with aisle in middle)
      for (let row = 1; row <= 9; row++) {
        const rowSeats = [];
        
        // Generate seat numbers based on row with updated labels
        let leftSeat1, leftSeat2, rightSeat1, rightSeat2;
        
        if (row === 1) {
          leftSeat1 = "A";
          leftSeat2 = "B";
          rightSeat1 = "क";
          rightSeat2 = "ख";
        } else if (row === 2) {
          leftSeat1 = "C";
          leftSeat2 = "D";
          rightSeat1 = "ग";
          rightSeat2 = "घ";
        } else {
          const seatNumber = (row - 2) * 2 - 1;
          leftSeat1 = `A${seatNumber}`;
          leftSeat2 = `A${seatNumber + 1}`;
          rightSeat1 = `B${seatNumber}`;
          rightSeat2 = `B${seatNumber + 1}`;
        }
        
        // Left side - 2 columns
        rowSeats.push({
          number: leftSeat1,
          available: !bookedSeats.includes(leftSeat1),
          type: 'left'
        });
        rowSeats.push({
          number: leftSeat2,
          available: !bookedSeats.includes(leftSeat2),
          type: 'left'
        });
        // Aisle space
        rowSeats.push(null);
        // Right side - 2 columns
        rowSeats.push({
          number: rightSeat1,
          available: !bookedSeats.includes(rightSeat1),
          type: 'right'
        });
        rowSeats.push({
          number: rightSeat2,
          available: !bookedSeats.includes(rightSeat2),
          type: 'right'
        });
        seats.push(rowSeats);
      }
    } else if (bus.type === 'Micro') {
      // Micro bus: 15 seats (Toyota Hiace style)
      // Layout: 3 columns, 5 rows
      for (let row = 1; row <= 5; row++) {
        const rowSeats = [];
        for (let col = 0; col < 3; col++) {
          const seatLetter = String.fromCharCode(65 + col); // A, B, C
          const seatNumber = `${seatLetter}${row}`;
          rowSeats.push({
            number: seatNumber,
            available: !bookedSeats.includes(seatNumber),
            type: 'left'
          });
        }
        seats.push(rowSeats);
      }
    }
    
    return seats;
  };

  const seatLayout = generateSeats();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        passengerName: currentUser?.fullName || '',
        passengerPhone: currentUser?.phoneNumber || '',
        seatNumber: '',
        boardingPoint: '',
        droppingPoint: ''
      });
      setSelectedSeats([]);
      setCurrentStep('seats');
      setActiveTab('amenities');
      setError('');
    }
  }, [isOpen, currentUser]);

  const handleSeatSelect = async (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      return;
    }
    
    // Check if seat is already booked
    if (bookedSeats.includes(seatNumber)) {
      setError('This seat is already booked. Please select another seat.');
      return;
    }
    
    setSeatCheckLoading(true);
    try {
      const isAvailable = await activeBookingsService.isSeatAvailable(
        bus.id, 
        new Date().toISOString().split('T')[0],
        seatNumber
      );
      
      if (!isAvailable) {
        setError('This seat has just been booked by someone else. Please select another seat.');
        setSeatCheckLoading(false);
        return;
      }
      
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
    setError('');
    
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
    
    const phoneRegex = /^(\+?977)?[0-9]{10}$/;
    if (!phoneRegex.test(formData.passengerPhone.replace(/\s/g, ''))) {
      setError('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const isAvailable = await activeBookingsService.isSeatAvailable(
        bus.id, 
        new Date().toISOString().split('T')[0],
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
      return time;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      'WiFi': Wifi,
      'AC': Snowflake,
      'TV': Monitor,
      'Snacks': Utensils,
      'Water Bottle': Utensils,
      'Blanket': Armchair,
      'Pillow': Armchair,
      'Charging Port': Monitor,
      'Entertainment': Monitor,
      'Rest Stops': MapPin
    };
    return iconMap[amenity] || Star;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal - Slides from bottom */}
      <div className={`fixed inset-x-0 bottom-0 z-50 bg-gray-100 rounded-t-3xl shadow-2xl transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      } max-h-[95vh] overflow-hidden`}>
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-10 rounded-t-3xl">
          <div className="flex items-center justify-between p-4 lg:px-6">
            {/* Close handle */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors mt-4"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Progress Steps */}
          <div className="px-4 lg:px-6 pb-4">
            <div className="flex items-center justify-center space-x-8">
              {['seats', 'details', 'confirmation'].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step 
                      ? 'bg-red-600 text-white' 
                      : index < ['seats', 'details', 'confirmation'].indexOf(currentStep)
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {index < ['seats', 'details', 'confirmation'].indexOf(currentStep) ? <Check className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={`ml-2 text-sm ${
                    currentStep === step ? 'text-red-600 font-medium' : 'text-gray-600'
                  }`}>
                    {step === 'seats' ? 'Select seats' : step === 'details' ? 'Passenger Info' : 'Review & Pay'}
                  </span>
                  {index < 2 && <div className="w-12 h-px bg-gray-300 mx-4"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)] px-4 lg:px-6 py-6">
          {currentStep === 'seats' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN - MINIMALISTIC SEAT SELECTOR CARD */}
              <div className="flex justify-center">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 w-full max-w-xs">
                  {/* Bus layout visualization */}
                  <div className="bg-gray-100 rounded-xl p-3">
                    {/* Driver area - Steering wheel icon */}
                    <div className="flex justify-end mb-3">
                      <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                        {/* Updated Steering wheel SVG */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h3.17l-.59-.59L9 10l1.41-1.41L12 10.17l1.59-1.58L15 10l-.59.41L13.83 11H17c0-2.76-2.24-5-5-5s-5 2.24-5 5zm10 2h-3.17l.59.59L15 14l-1.41 1.41L12 13.83l-1.59 1.58L9 14l.59-.41L10.17 13H7c0 2.76 2.24 5 5 5s5-2.24 5-5z"/>
                        </svg>
                      </div>
                    </div>
                    
                    {/* Seat Layout */}
                    <div className="bg-white rounded-xl p-3 border-2 border-dashed border-gray-300">
                      <div className="space-y-3">
                        {seatLayout.map((row, rowIndex) => (
                          <div key={rowIndex} className="flex justify-center items-center gap-1">
                            {row.map((seat, colIndex) => (
                              <div key={seat?.number || `aisle-${colIndex}`} className="flex items-center">
                                {seat ? (
                                  <button
                                    onClick={() => seat.available && handleSeatSelect(seat.number)}
                                    disabled={!seat.available || seatCheckLoading}
                                    className={`w-10 h-10 rounded border text-xs font-bold transition-all flex items-center justify-center shadow-sm ${
                                      selectedSeats.includes(seat.number)
                                        ? 'bg-green-600 border-green-600 text-white shadow-lg'
                                        : seat.available
                                        ? 'bg-white border-gray-300 text-gray-700 hover:border-green-400 hover:shadow-md'
                                        : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                    }`}
                                  >
                                    {seat.number}
                                  </button>
                                ) : (
                                  <div className="w-6 h-10 bg-gray-200 rounded opacity-50"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* RIGHT COLUMN - BUS DETAILS */}
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-gray-900">{bus.name}</h2>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 fill-green-500 text-green-500" />
                        <span className="font-medium">4.8</span>
                        <span className="text-gray-500">975</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                      <span>{formatTime(bus.departureTime)} - {formatTime(bus.arrivalTime)}</span>
                      <span>{bus.model || 'Standard'} A/C {bus.type}</span>
                    </div>
                  </div>
                  
                  {/* Bus Photos Card */}
                  <div className="mb-6">
                    <div className="grid grid-cols-3 gap-3 rounded-xl overflow-hidden">
                      {/* Placeholder photos - replace with actual photos from bus.photos */}
                      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 flex items-center justify-center text-lg font-bold rounded-xl shadow-md">
                        {bus.name}
                      </div>
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 flex items-center justify-center text-gray-500 rounded-xl">
                        <div className="text-center">
                          <div className="text-2xl mb-1">📷</div>
                          <div className="text-xs">No Image</div>
                        </div>
                      </div>
                      <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 flex items-center justify-center text-gray-500 rounded-xl">
                        <div className="text-center">
                          <div className="text-2xl mb-1">📷</div>
                          <div className="text-xs">No Image</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tabs Card */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-1 overflow-x-auto">
                      {[
                        { id: 'amenities', label: 'Amenities' },
                        { id: 'boarding', label: 'Boarding Points' },
                        { id: 'dropping', label: 'Dropping Points' },
                        { id: 'rest-stop', label: 'Rest Stops' },
                        { id: 'reviews', label: 'Rate & Reviews' }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id as any)}
                          className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap rounded-t-lg ${
                            activeTab === tab.id
                              ? 'border-red-500 text-red-600 bg-red-50'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                  
                  <div className="min-h-[200px]">
                    {activeTab === 'amenities' && (
                      <div className="space-y-4">
                        {bus.amenities.map((amenity, index) => {
                          const IconComponent = getAmenityIcon(amenity);
                          return (
                            <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-green-600" />
                              </div>
                              <span className="text-gray-700 font-medium">{amenity}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {activeTab === 'boarding' && (
                      <ComingSoon 
                        title="Boarding Points" 
                        description="Detailed boarding point information" 
                        icon={MapPin}
                        compact={true}
                      />
                    )}
                    
                    {activeTab === 'dropping' && (
                      <ComingSoon 
                        title="Dropping Points" 
                        description="Detailed dropping point information" 
                        icon={MapPin}
                        compact={true}
                      />
                    )}
                    
                    {activeTab === 'rest-stop' && (
                      <ComingSoon 
                        title="Rest Stops" 
                        description="Detailed rest stop information" 
                        icon={MapPin}
                        compact={true}
                      />
                    )}
                    
                    {activeTab === 'reviews' && (
                      <ComingSoon 
                        title="Rate & Reviews" 
                        description="Customer reviews and ratings" 
                        icon={Star}
                        compact={true}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'details' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Passenger Details</h3>
                <p className="text-sm text-gray-600">Enter passenger information for seat {selectedSeats[0]}</p>
                {currentUser && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Details pre-filled from your account
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Enter dropping point"
                  />
                </div>
              </div>
            </div>
          )}
          
          {currentStep === 'confirmation' && (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Pay</h3>
                <p className="text-sm text-gray-600">Please review your booking details</p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-red-600" />
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
                  {currentUser && (
                    <div className="flex justify-between items-center mb-2 bg-green-50 -mx-2 px-2 py-1 rounded">
                      <span className="text-sm text-green-700">Account:</span>
                      <span className="text-sm font-medium text-green-700">✓ Linked to {currentUser.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-red-600">NPR {bus.price}</span>
                  </div>
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* General Error Display */}
          {error && currentStep !== 'confirmation' && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {currentStep === 'seats' && selectedSeats.length > 0 && `Selected: ${selectedSeats[0]}`}
              {currentStep === 'details' && `Seat ${selectedSeats[0]} - NPR ${bus.price}`}
              {currentStep === 'confirmation' && `Total: NPR ${bus.price}`}
            </div>
            
            <div className="flex items-center gap-3">
              {currentStep !== 'seats' && (
                <button
                  onClick={() => setCurrentStep(currentStep === 'confirmation' ? 'details' : 'seats')}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              
              {currentStep === 'confirmation' ? (
                <button
                  onClick={handleConfirmBooking}
                  disabled={loading}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      Pay NPR {bus.price}
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
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-xl font-medium transition-colors"
                >
                  {currentStep === 'seats' ? 'Continue' : 'Continue'}
                </button>
              )}
            </div>
          </div>
          
          {/* Seat check loading indicator */}
          {seatCheckLoading && (
            <div className="mt-3 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                Checking seat availability...
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}