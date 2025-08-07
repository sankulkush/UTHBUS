'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  viewMode?: 'list';
  bookedSeats: string[];
  currentUser?: UserProfile | null;
  searchDate?: string;
}

export default function BusCard({ bus, onBook, viewMode = 'list', bookedSeats, currentUser, searchDate }: BusCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 1. REPLACE formData state with individual states
  const [passengerName, setPassengerName] = useState('');
  const [passengerPhone, setPassengerPhone] = useState('');
  const [boardingPoint, setBoardingPoint] = useState('');
  const [droppingPoint, setDroppingPoint] = useState('');
  const [seatNumber, setSeatNumber] = useState('');
  
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'seats' | 'details' | 'confirmation'>('seats');
  const [activeTab, setActiveTab] = useState<'amenities' | 'rest-stop' | 'reviews' | 'boarding' | 'dropping'>('amenities');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seatCheckLoading, setSeatCheckLoading] = useState(false);
  const [showBusDetails, setShowBusDetails] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // FIX: Create service instance only once using useMemo
  const activeBookingsService = useMemo(() => new ActiveBookingsService(), []);
  
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
  
  // 3. UPDATE the reset effect
  useEffect(() => {
    if (isExpanded) {
      setPassengerName(currentUser?.fullName || '');
      setPassengerPhone(currentUser?.phoneNumber || '');
      setBoardingPoint('');
      setDroppingPoint('');
      setSeatNumber('');
      setSelectedSeats([]);
      setCurrentStep('seats');
      setActiveTab('amenities');
      setError('');
      setShowBusDetails(false);
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
  
  // 4. STABLE input handlers
  const handlePassengerNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassengerName(e.target.value);
  }, []);

  const handlePassengerPhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassengerPhone(e.target.value);
  }, []);

  const handleBoardingPointChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setBoardingPoint(e.target.value);
  }, []);

  const handleDroppingPointChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDroppingPoint(e.target.value);
  }, []);
  
  // 5. UPDATE handleNextStep function
  const handleNextStep = () => {
    setError('');
    
    if (currentStep === 'seats' && selectedSeats.length > 0) {
      setSeatNumber(selectedSeats[0]);
      setCurrentStep('details');
    } else if (currentStep === 'details' && passengerName && passengerPhone) {
      setCurrentStep('confirmation');
    }
  };
  
  // 6. UPDATE handleConfirmBooking function
  const handleConfirmBooking = async () => {
    if (!passengerName || !passengerPhone || !selectedSeats.length) {
      setError('Please fill in all required fields');
      return;
    }
    
    const phoneRegex = /^(\+?977)?[0-9]{10}$/;
    if (!phoneRegex.test(passengerPhone.replace(/\s/g, ''))) {
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
        passengerName: passengerName,
        passengerPhone: passengerPhone,
        seatNumber: selectedSeats[0],
        totalPrice: bus.price * selectedSeats.length,
        boardingPoint: boardingPoint || undefined,
        droppingPoint: droppingPoint || undefined
      });
      
      // Reset form
      setPassengerName(currentUser?.fullName || '');
      setPassengerPhone(currentUser?.phoneNumber || '');
      setBoardingPoint('');
      setDroppingPoint('');
      setSeatNumber('');
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
    <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
      <div className="border-t border-gray-200 bg-gray-50">
        {/* Fixed height container */}
        <div className="min-h-[600px] md:min-h-[600px] flex flex-col">
          {/* Content area - flexible height */}
          <div className="flex-1 p-4 md:p-6 pb-0">
            {currentStep === 'seats' && (
              <div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 xl:gap-2">
                  {/* Seat Selector */}
                  <div className="flex justify-center xl:justify-start">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 w-full max-w-sm xl:max-w-none">
                      <div className="bg-gray-100 rounded-xl p-2 sm:p-3">
                        <div className="flex justify-end mb-2 sm:mb-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center">
                            <img
                              src="/steering-wheel.svg"
                              alt="Steering wheel"
                            />
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
                  
                  {/* Bus Details for Desktop */}
                  <div className="hidden xl:block xl:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                      <div className="mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          <h2 className="text-lg sm:text-xl font-bold text-gray-900">{bus.name}</h2>
                        </div>
                      </div>
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
                  
                  {/* Bus Details Toggle for Mobile */}
                  <div className="xl:hidden">
                    <button
                      onClick={() => setShowBusDetails(!showBusDetails)}
                      className="w-full bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex items-center justify-between"
                    >
                      <span className="font-medium text-gray-900">Bus Details</span>
                      {showBusDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                    
                    {showBusDetails && (
                      <div className="mt-4 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                        <div className="mb-4">
                          <h2 className="text-lg font-bold text-gray-900 mb-4">{bus.name}</h2>
                          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden mb-4">
                            <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 flex items-center justify-center text-gray-500 rounded-xl">
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">No Image</div>
                              </div>
                            </div>
                            <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-4 flex items-center justify-center text-gray-500 rounded-xl">
                              <div className="text-center">
                                <div className="text-xl mb-1">📷</div>
                                <div className="text-xs">No Image</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-b border-gray-200 mb-4">
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
                                className={`py-2 px-3 border-b-2 font-medium text-xs whitespace-nowrap rounded-t-lg ${
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
                        
                        <div className="min-h-[100px]">
                          {activeTab === 'amenities' && (
                            <div className="grid grid-cols-1 gap-2">
                              {bus.amenities.map((amenity, index) => {
                                const IconComponent = getAmenityIcon(amenity);
                                return (
                                  <div key={index} className="flex items-center gap-2">
                                    <IconComponent className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                    <span className="text-gray-700 text-sm">{amenity}</span>
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
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 'details' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Passenger Details</h3>
                  <p className="text-sm text-gray-600">Enter passenger information for seat {selectedSeats[0]}</p>
                  {currentUser && (
                    <p className="text-xs text-green-600 mt-1">
                      ✓ Details pre-filled from your account
                    </p>
                  )}
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        {/* 7. UPDATE Full Name Input */}
                        <input
                          type="text"
                          value={passengerName}
                          onChange={handlePassengerNameChange}
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
                        {/* 7. UPDATE Phone Number Input */}
                        <input
                          type="tel"
                          value={passengerPhone}
                          onChange={handlePassengerPhoneChange}
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
                      {/* 7. UPDATE Boarding Point Input */}
                      <input
                        type="text"
                        value={boardingPoint}
                        onChange={handleBoardingPointChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter boarding point"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dropping Point (Optional)
                      </label>
                      {/* 7. UPDATE Dropping Point Input */}
                      <input
                        type="text"
                        value={droppingPoint}
                        onChange={handleDroppingPointChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm sm:text-base"
                        placeholder="Enter dropping point"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 'confirmation' && (
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Review & Pay</h3>
                  <p className="text-sm text-gray-600">Please review your booking details</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6 max-w-4xl mx-auto">
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 space-y-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-gray-900 truncate">{bus.name}</h4>
                        <p className="text-sm text-gray-600 truncate">{bus.startPoint} → {bus.endPoint}</p>
                        <p className="text-xs text-gray-500">Travel Date: {new Date(travelDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm">Departure: {formatTime(bus.departureTime)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm">Arrival: {formatTime(bus.arrivalTime)}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      {/* 9. UPDATE confirmation display section */}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Passenger:</span>
                        <span className="text-sm font-medium truncate ml-2">{passengerName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium">{passengerPhone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Seat:</span>
                        <span className="text-sm font-medium">{selectedSeats[0]}</span>
                      </div>
                      {boardingPoint && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Boarding:</span>
                          <span className="text-sm font-medium truncate ml-2">{boardingPoint}</span>
                        </div>
                      )}
                      {droppingPoint && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Dropping:</span>
                          <span className="text-sm font-medium truncate ml-2">{droppingPoint}</span>
                        </div>
                      )}
                      {currentUser && (
                        <div className="flex justify-between items-center bg-green-50 -mx-2 px-2 py-1 rounded">
                          <span className="text-sm text-green-700">Account:</span>
                          <span className="text-sm font-medium text-green-700 truncate ml-2">✓ Linked to {currentUser.email}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center text-base sm:text-lg font-semibold border-t pt-2 mt-3">
                        <span>Total:</span>
                        <span className="text-red-600">रु {bus.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Spacer to push controls to bottom */}
            <div className="flex-1"></div>
          </div>
          
          {/* Fixed position controls at bottom - Always in same position */}
          <div className="bg-gray-50 border-t border-gray-200 mt-auto">
            {/* General Error Display */}
            {error && (
              <div className="px-4 pt-3">
                <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
            
            {/* Seat check loading indicator */}
            {seatCheckLoading && (
              <div className="px-4 pt-2">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
                    Checking seat availability...
                  </div>
                </div>
              </div>
            )}
            
            {/* Progress Steps */}
            <div className="px-4 pt-3">
              <div className="flex items-center justify-center space-x-2 md:space-x-8 overflow-x-auto">
                {['seats', 'details', 'confirmation'].map((step, index) => (
                  <div key={step} className="flex items-center flex-shrink-0">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                      currentStep === step 
                        ? 'bg-red-600 text-white' 
                        : index < ['seats', 'details', 'confirmation'].indexOf(currentStep)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {index < ['seats', 'details', 'confirmation'].indexOf(currentStep) ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : index + 1}
                    </div>
                    <span className={`ml-1 md:ml-2 text-xs md:text-sm whitespace-nowrap ${
                      currentStep === step ? 'text-red-600 font-medium' : 'text-gray-600'
                    }`}>
                      {step === 'seats' ? 'Select seats' : step === 'details' ? 'Passenger Info' : 'Review & Pay'}
                    </span>
                    {index < 2 && <div className="w-4 md:w-12 h-px bg-gray-300 mx-1 md:mx-4"></div>}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Footer Controls */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-4">
              <div className="text-xs md:text-sm text-gray-600 text-center md:text-left">
                {currentStep === 'seats' && selectedSeats.length > 0 && `Selected: ${selectedSeats[0]}`}
                {currentStep === 'details' && `Seat ${selectedSeats[0]} - रु ${bus.price}`}
                {currentStep === 'confirmation' && `Total: रु ${bus.price}`}
              </div>
              
              <div className="flex items-center justify-center md:justify-end gap-2 md:gap-3">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="px-4 md:px-6 py-2 text-sm md:text-base text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                
                {currentStep !== 'seats' && (
                  <button
                    onClick={() => setCurrentStep(currentStep === 'confirmation' ? 'details' : 'seats')}
                    className="px-4 md:px-6 py-2 text-sm md:text-base text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                )}
                
                {currentStep === 'confirmation' ? (
                  <button
                    onClick={handleConfirmBooking}
                    disabled={loading}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 md:px-6 py-2 rounded-xl font-medium transition-colors text-sm md:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span className="hidden md:inline">Booking...</span>
                        <span className="md:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        <span className="hidden md:inline">Pay रु {bus.price}</span>
                        <span className="md:hidden">Pay</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleNextStep}
                    // 8. UPDATE the validation in Continue button
                    disabled={
                      (currentStep === 'seats' && selectedSeats.length === 0) ||
                      (currentStep === 'details' && (!passengerName || !passengerPhone)) ||
                      seatCheckLoading
                    }
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 md:px-6 py-2 rounded-xl font-medium transition-colors text-sm md:text-base"
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  // List view implementation
  return (
    <div ref={cardRef} className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Main Bus Card */}
      <div 
        className="p-3 md:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={handleCardClick}
      >
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0 pr-2">
              <div className="space-y-1">
              {/* line 1: name, type badge and rating all in one row */}
              <div className="inline-flex items-center space-x-1 text-base font-semibold text-gray-900">
                    <span className="truncate">{bus.name}</span>
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${getBusTypeColor(bus.type)}`}>
                      {bus.type}
                    </span>
                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    <span className="text-xs font-medium text-gray-700">4.8</span>
                  </div>

              {/* line 2: model below */}
              <div className="text-xs text-gray-500 truncate">
                {bus.model}
              </div>
            </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-blue-600">रु {bus.price}</div>
              {isExpanded ? <ChevronUp className="w-4 h-4 ml-auto mt-1" /> : <ChevronDown className="w-4 h-4 ml-auto mt-1" />}
            </div>
          </div>
          
          <div className="flex items-center justify-between mb-3">
            <div className="text-center flex-shrink-0">
              <div className="text-base font-semibold text-gray-900">{formatTime(bus.departureTime)}</div>
              <div className="text-xs text-gray-500 truncate w-25">{bus.startPoint}</div>
            </div>
            
            <div className="flex flex-col items-center gap-1 flex-1 mx-2">
              <div className="text-xs text-gray-500">{calculateDuration(bus.departureTime, bus.arrivalTime)}</div>
              <div className="w-full h-px bg-gray-300 relative max-w-[120px]">
                <div className="absolute left-0 top-0 w-1.5 h-1.5 bg-green-500 rounded-full transform -translate-y-1/2"></div>
                <div className="absolute right-0 top-0 w-1.5 h-1.5 bg-red-500 rounded-full transform -translate-y-1/2"></div>
              </div>
              <Clock className="w-3 h-3 text-gray-400" />
            </div>
            
            <div className="text-center flex-shrink-0">
              <div className="text-base font-semibold text-gray-900">{formatTime(bus.arrivalTime)}</div>
              <div className="text-xs text-gray-500 truncate w-25">{bus.endPoint}</div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-1 mb-3">
            {bus.amenities.slice(0, 2).map((amenity) => {
              const IconComponent = getAmenityIcon(amenity);
              return (
                <span 
                  key={amenity}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  <IconComponent className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[60px]">{amenity}</span>
                </span>
              );
            })}
            {bus.amenities.length > 2 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                +{bus.amenities.length - 2}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{bus.seatCapacity} seats</span>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {new Date(travelDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-xl font-semibold text-gray-900">{bus.name}</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getBusTypeColor(bus.type)}`}>
                {bus.type}
              </span>
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="font-medium">4.8</span>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <span>{bus.model}</span>
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
              <div className="text-2xl font-bold text-blue-600">रु {bus.price}</div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm text-red-600">View seats</span>
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