'use client';
import { useState, useEffect, useRef } from 'react';
import { Clock, MapPin, Users, Star, X, Wifi, Snowflake, Monitor, Utensils, Armchair, Phone, User, Check, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import { ActiveBookingsService } from '@/components/operator/counter/services/active-booking.service';
import ComingSoon from '@/components/ComingSoon';
import type { IBus } from "@/components/operator/counter/types/counter.types";
import type { UserProfile } from '@/contexts/user-auth-context';

interface BusCardProps {
  bus: IBus;
  onBook: (bookingData: {
    busId: string;
    passengerName: string;
    passengerPhone: string;
    seatNumber: string;
    totalPrice: number;
    boardingPoint?: string;
    droppingPoint?: string;
  }) => Promise<void>;
  viewMode?: 'grid' | 'list';
  bookedSeats: string[];
  currentUser?: UserProfile | null;
  searchDate?: string;
}

export default function BusCard({ bus, onBook, viewMode = 'grid', bookedSeats, currentUser, searchDate }: BusCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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
  const cardRef = useRef<HTMLDivElement>(null);
  const activeBookingsService = new ActiveBookingsService();

  // Get the travel date for booking - use searchDate or current date
  const travelDate = searchDate || new Date().toISOString().split('T')[0];

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

  // Generate seat layout based on bus type
  const generateSeats = () => {
    const seats = [];
    
    if (bus.type === 'Deluxe') {
      for (let row = 1; row <= 9; row++) {
        const rowSeats = [];
        
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
        rowSeats.push(null);
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
      for (let row = 1; row <= 5; row++) {
        const rowSeats = [];
        for (let col = 0; col < 3; col++) {
          const seatLetter = String.fromCharCode(65 + col);
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

  // Scroll to center the card when expanded
  useEffect(() => {
    if (isExpanded && cardRef.current) {
      setTimeout(() => {
        cardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  }, [isExpanded]);

  // Reset form when expanded
  useEffect(() => {
    if (isExpanded) {
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
  }, [isExpanded, currentUser]);

  const handleSeatSelect = async (seatNumber: string) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      return;
    }
    
    if (bookedSeats.includes(seatNumber)) {
      setError('This seat is already booked. Please select another seat.');
      return;
    }
    
    setSeatCheckLoading(true);
    try {
      const isAvailable = await activeBookingsService.isSeatAvailable(
        bus.id, 
        travelDate,
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
        travelDate,
        selectedSeats[0]
      );
      
      if (!isAvailable) {
        throw new Error('This seat is no longer available. Please select another seat.');
      }
      
      await onBook({
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
      setIsExpanded(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };

  // Shared expanded booking section component
  const ExpandedBookingSection = () => (
    <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
      <div className="border-t border-gray-200 bg-gray-50 p-6">
        {currentStep === 'seats' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-2">
            {/* Seat Selector - Responsive sizing */}
            <div className="flex justify-center xl:justify-start">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 w-full max-w-sm xl:max-w-none">
                <div className="bg-gray-100 rounded-xl p-2 sm:p-3">
                  <div className="flex justify-end mb-2 sm:mb-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-800 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-6 w-6 sm:h-7 sm:w-7 text-white" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h3.17l-.59-.59L9 10l1.41-1.41L12 10.17l1.59-1.58L15 10l-.59.41L13.83 11H17c0-2.76-2.24-5-5-5s-5 2.24-5 5zm10 2h-3.17l.59.59L15 14l-1.41 1.41L12 13.83l-1.59 1.58L9 14l.59-.41L10.17 13H7c0 2.76 2.24 5 5 5s5-2.24 5-5z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-2 sm:p-3 border-2 border-dashed border-gray-300">
                    <div className="space-y-2 sm:space-y-3">
                      {seatLayout.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex justify-center items-center gap-1">
                          {row.map((seat, colIndex) => (
                            <div key={seat?.number || `aisle-${colIndex}`} className="flex items-center">
                              {seat ? (
                                <button
                                  onClick={() => seat.available && handleSeatSelect(seat.number)}
                                  disabled={!seat.available || seatCheckLoading}
                                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded border text-xs font-bold transition-all flex items-center justify-center shadow-sm ${
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
                                <div className="w-4 h-8 sm:w-6 sm:h-10 bg-gray-200 rounded opacity-50"></div>
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

            {/* Bus Details - Responsive sizing */}
            <div className="xl:col-span-2">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                {/* Header */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">{bus.name}</h2>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-4 h-4 fill-green-500 text-green-500" />
                      <span className="font-medium">4.8</span>
                      <span className="text-gray-500">975</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                    <span>{formatTime(bus.departureTime)} - {formatTime(bus.arrivalTime)}</span>
                    <span>{bus.model || 'Standard'} A/C {bus.type}</span>
                  </div>
                </div>

                {/* Bus Photos Grid - Responsive */}
                <div className="mb-4 sm:mb-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 rounded-xl overflow-hidden">
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-3 sm:p-6 flex items-center justify-center text-gray-500 rounded-xl">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl mb-1">📷</div>
                        <div className="text-xs">No Image</div>
                      </div>
                    </div>
                    <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-3 sm:p-6 flex items-center justify-center text-gray-500 rounded-xl">
                      <div className="text-center">
                        <div className="text-xl sm:text-2xl mb-1">📷</div>
                        <div className="text-xs">No Image</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs - Responsive scrolling */}
                <div className="border-b border-gray-200 mb-4 sm:mb-6">
                  <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
                    {[
                      { id: 'amenities', label: 'Amenities' },
                      { id: 'boarding', label: 'Boarding' },
                      { id: 'dropping', label: 'Dropping' },
                      { id: 'rest-stop', label: 'Rest Stops' },
                      { id: 'reviews', label: 'Reviews' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-2 sm:py-3 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap rounded-t-lg ${
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
                
                <div className="min-h-[150px] sm:min-h-[200px]">
                  {activeTab === 'amenities' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3">
                      {bus.amenities.map((amenity, index) => {
                        const IconComponent = getAmenityIcon(amenity);
                        return (
                          <div key={index} className="flex items-center gap-2 sm:gap-3">
                            <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
                            <span className="text-gray-700 text-xs sm:text-sm">{amenity}</span>
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
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Passenger Details</h3>
              <p className="text-sm text-gray-600">Enter passenger information for seat {selectedSeats[0]}</p>
              {currentUser && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Details pre-filled from your account
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Enter dropping point"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 'confirmation' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-4xl mx-auto">
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
                  <p className="text-xs text-gray-500">Travel Date: {new Date(travelDate).toLocaleDateString()}</p>
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
            </div>
          </div>
        )}

        {/* Progress Steps - Moved below the cards */}
        <div className="mt-4 sm:mt-6 mb-4">
          <div className="flex items-center justify-center space-x-4 sm:space-x-8 overflow-x-auto px-4">
            {['seats', 'details', 'confirmation'].map((step, index) => (
              <div key={step} className="flex items-center flex-shrink-0">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                  currentStep === step 
                    ? 'bg-red-600 text-white' 
                    : index < ['seats', 'details', 'confirmation'].indexOf(currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index < ['seats', 'details', 'confirmation'].indexOf(currentStep) ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : index + 1}
                </div>
                <span className={`ml-1 sm:ml-2 text-xs sm:text-sm whitespace-nowrap ${
                  currentStep === step ? 'text-red-600 font-medium' : 'text-gray-600'
                }`}>
                  {step === 'seats' ? 'Select seats' : step === 'details' ? 'Passenger Info' : 'Review & Pay'}
                </span>
                {index < 2 && <div className="w-8 sm:w-12 h-px bg-gray-300 mx-2 sm:mx-4"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* General Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Footer Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 pt-4 border-t border-gray-200">
          <div className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
            {currentStep === 'seats' && selectedSeats.length > 0 && `Selected: ${selectedSeats[0]}`}
            {currentStep === 'details' && `Seat ${selectedSeats[0]} - NPR ${bus.price}`}
            {currentStep === 'confirmation' && `Total: NPR ${bus.price}`}
          </div>
          
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            
            {currentStep !== 'seats' && (
              <button
                onClick={() => setCurrentStep(currentStep === 'confirmation' ? 'details' : 'seats')}
                className="px-4 sm:px-6 py-2 text-sm sm:text-base text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
            
            {currentStep === 'confirmation' ? (
              <button
                onClick={handleConfirmBooking}
                disabled={loading}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span className="hidden sm:inline">Booking...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span className="hidden sm:inline">Pay NPR {bus.price}</span>
                    <span className="sm:hidden">Pay</span>
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
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-xl font-medium transition-colors text-sm sm:text-base"
              >
                Continue
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
  );

  if (viewMode === 'list') {
    return (
      <div ref={cardRef} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Main Bus Card - Made wider to align with search bar */}
        <div 
          className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={handleCardClick}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl font-semibold text-gray-900">{bus.name}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBusTypeColor(bus.type)}`}>
                  {bus.type}
                </span>
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-green-500 text-green-500" />
                  <span className="font-medium">4.8</span>
                  <span className="text-gray-500">975</span>
                </div>
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
              <div className="flex flex-wrap gap-2">
                {bus.amenities.slice(0, 4).map((amenity) => {
                  const IconComponent = getAmenityIcon(amenity);
                  return (
                    <span 
                      key={amenity}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      <IconComponent className="w-3 h-3" />
                      {amenity}
                    </span>
                  );
                })}
                {bus.amenities.length > 4 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    +{bus.amenities.length - 4} more
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{formatTime(bus.departureTime)}</div>
                <div className="text-sm text-gray-500">{bus.startPoint}</div>
              </div>
              
              <div className="flex flex-col items-center gap-1">
                <div className="text-sm text-gray-500">{calculateDuration(bus.departureTime, bus.arrivalTime)}</div>
                <div className="w-20 h-px bg-gray-300"></div>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              
              <div className="text-center">
                <div className="text-xl font-semibold text-gray-900">{formatTime(bus.arrivalTime)}</div>
                <div className="text-sm text-gray-500">{bus.endPoint}</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">NPR {bus.price}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Click to book</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Expanded Booking Section */}
        <ExpandedBookingSection />
      </div>
    );
  }

  // Grid view implementation - Also made wider
  return (
    <div ref={cardRef} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Grid view main card */}
      <div 
        className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleCardClick}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{bus.name}</h3>
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getBusTypeColor(bus.type)} w-fit`}>
              {bus.type}
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span>4.2</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 sm:mb-4">
          <div className="text-center sm:text-left">
            <div className="text-lg sm:text-xl font-semibold text-gray-900">{formatTime(bus.departureTime)}</div>
            <div className="text-xs sm:text-sm text-gray-500 truncate">{bus.startPoint}</div>
          </div>
          
          <div className="flex flex-col items-center gap-1 flex-1 mx-4">
            <div className="text-xs sm:text-sm text-gray-500">{calculateDuration(bus.departureTime, bus.arrivalTime)}</div>
            <div className="w-full h-px bg-gray-300 relative">
              <div className="absolute left-0 top-0 w-2 h-2 bg-green-500 rounded-full transform -translate-y-1/2"></div>
              <div className="absolute right-0 top-0 w-2 h-2 bg-red-500 rounded-full transform -translate-y-1/2"></div>
            </div>
            <Clock className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="text-center sm:text-right">
            <div className="text-lg sm:text-xl font-semibold text-gray-900">{formatTime(bus.arrivalTime)}</div>
            <div className="text-xs sm:text-sm text-gray-500 truncate">{bus.endPoint}</div>
          </div>
        </div>
        
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-wrap gap-2">
            {bus.amenities.slice(0, 3).map((amenity) => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <span 
                  key={amenity}
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
                >
                  <IconComponent className="w-3 h-3" />
                  <span className="truncate">{amenity}</span>
                </span>
              );
            })}
            {bus.amenities.length > 3 && (
              <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                +{bus.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{bus.seatCapacity} seats</span>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Travel: {new Date(travelDate).toLocaleDateString()}
            </span>
          </div>
          
          <div className="text-center sm:text-right">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">NPR {bus.price}</div>
            <div className="text-xs text-gray-500">Click anywhere to book</div>
          </div>
        </div>
      </div>
      
      {/* Expanded Booking Section */}
      <ExpandedBookingSection />
    </div>
  );
}