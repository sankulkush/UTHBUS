export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  trips: number;
}

export interface Operator {
  id: string;
  name: string;
  email: string;
  phone: string;
  busIds: string[];
}

export interface Bus {
  id: string;
  operatorId: string;
  conductorPhone: string;
  startPoint: string;
  endPoint: string;
  busType: string;
  seatCapacity: number;
  isAC: boolean;
  price: number;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  amenities: string[];
  boardingPoints: string[];
  droppingPoints: string[];
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
