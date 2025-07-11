export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  trips: number;
}

export interface Bus {
  id: string;
  name: string;
  type: 'Micro' | 'Deluxe' | 'AC Deluxe';
  model: string;
  isAC: boolean;
  amenities: string[];
  routes: string[];
  startPoint: string;
  endPoint: string;
  boardingPoints: string[];
  droppingPoints: string[];
  photos: string[];
  description: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  seatCapacity: number;
  operatorId: string;
  status: 'Active' | 'Inactive' | 'Maintenance';
  nextRoute?: string;
  nextDeparture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  licenseNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface Route {
  id: string;
  startPoint: string;
  endPoint: string;
  via: string[];
  isReturning: boolean;
}

export interface Trip {
  id: string;
  busId: string;
  startPoint: string;
  endPoint: string;
  date: string;         // ISO date
  departureTime: string;
}

export interface ActiveBooking {
  id: string;
  userId: string;
  operatorId: string;   // derive from bus.operatorId
  busId: string;
  date: string;
  userPhone: string;
  conductorPhone: string;
  paymentInfo: any;
}

export interface PastBooking extends ActiveBooking {
  completedAt: string;
}
