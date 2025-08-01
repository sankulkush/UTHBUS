// types/booking.types.ts

export interface Seat {
  number: string;
  available: boolean;
  type: 'left' | 'right' | 'window' | 'aisle';
  gender?: 'male' | 'female' | 'any';
  isSelected?: boolean;
  isBooked?: boolean;
}

export interface SeatLayout {
  rows: Seat[][];
  totalSeats: number;
  busType: 'Deluxe' | 'Hiace' | 'Micro' | 'Standard';
}

export interface BookingStep {
  id: 'seats' | 'details' | 'confirmation';
  title: string;
  completed: boolean;
  active: boolean;
}

export interface BookingFormData {
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  boardingPoint?: string;
  droppingPoint?: string;
  gender?: 'male' | 'female';
  age?: number;
}

export interface BookingConfirmation {
  busId: string;
  passengerName: string;
  passengerPhone: string;
  seatNumber: string;
  totalPrice: number;
  boardingPoint?: string;
  droppingPoint?: string;
  bookingId?: string;
  timestamp?: Date;
}

export interface TabOption {
  id: 'amenities' | 'rest-stop' | 'reviews' | 'boarding' | 'dropping';
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

// Extend the existing IBus interface if needed
export interface ExtendedBusInfo {
  photos: string[];
  boardingPoints: string[];
  droppingPoints: string[];
  restStops: string[];
  reviews: {
    rating: number;
    count: number;
    comments: string[];
  };
  policies: {
    cancellation: string;
    refund: string;
    baggage: string;
  };
}