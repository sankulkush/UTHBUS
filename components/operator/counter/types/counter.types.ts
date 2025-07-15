// Core Types following Interface Segregation Principle
export type MenuItem = "book-ticket" | "my-buses" | "booked-transactions" | "booking-history"

export interface IOperator {
  id: string
  name: string
  email: string
  phone: string
  companyName: string
  licenseNumber: string
}

export interface IBus {
  id: string
  operatorId: string
  name: string
  type: BusType
  model: string
  isAC: boolean
  amenities: string[]
  routes: string[]
  startPoint: string
  endPoint: string
  boardingPoints: string[]
  droppingPoints: string[]
  photos: string[]
  status: BusStatus
  nextRoute?: string
  nextDeparture?: string
  // New timing fields
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  seatCapacity: number
}

export interface IBooking {
  id: string
  busId: string
  operatorId: string
  passengerName: string
  passengerPhone: string
  from: string
  to: string
  date: string
  time: string
  seatNumber: string
  amount: number
  status: BookingStatus
  bookingDate: string
  boardingPoint: string
  droppingPoint: string
  busName?: string
  busType?: string
}

export interface IDashboardStats {
  todayBookings: number
  pendingDepartures: number
  todayRevenue: number
  monthlyRevenue: number
  totalBuses: number
  activeBuses: number
}

export type BusType = "Micro" | "Deluxe" | "AC Deluxe"
export type BusStatus = "Active" | "Maintenance" | "Inactive"
export type BookingStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed"

// Service Interfaces following Dependency Inversion Principle
export interface IBookingService {
  createBooking(booking: Omit<IBooking, "id" | "bookingDate">): Promise<IBooking>
  getBookings(operatorId: string): Promise<IBooking[]>
  getBookingHistory(operatorId: string): Promise<IBooking[]>
  updateBooking(id: string, updates: Partial<IBooking>): Promise<IBooking>
  cancelBooking(id: string): Promise<void>
}

export interface IBusService {
  getBuses(operatorId: string): Promise<IBus[]>;
  createBus(bus: Omit<IBus, "id">): Promise<IBus>;
  updateBus(id: string, updates: Partial<IBus>): Promise<IBus>;
  deleteBus(id: string): Promise<void>;
  searchBuses(from: string, to: string, date: string, operatorId: string): Promise<IBus[]>;
  getBusById(id: string): Promise<IBus | null>;
  // New method for global search
  searchAllBuses(from: string, to: string, date: string): Promise<IBus[]>;
}

export interface IDashboardService {
  getDashboardStats(operatorId: string): Promise<IDashboardStats>
  getBookingTrends(operatorId: string): Promise<any[]>
  getRevenueTrends(operatorId: string): Promise<any[]>
}

export interface IAuthService {
  getCurrentOperator(): Promise<IOperator | null>
  login(email: string, password: string): Promise<IOperator>
  logout(): Promise<void>
}

export interface IActiveBookingData {
  operatorId: string;
  userId?: string;
  busId: string;
  busName: string;
  busType: string;
  from: string;
  to: string;
  date: string;
  time: string;
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  boardingPoint: string;
  droppingPoint: string;
  amount: number;
  status: "booked" | "cancelled" | "completed";
  bookingTime: any;
}
