// Core section type for the new portal navigation
export type ActiveSection =
  | "dashboard"
  | "bookings"
  | "trips"
  | "buses"
  | "routes"
  | "seats"
  | "reports"
  | "notifications"
  | "settings"
  | "book-ticket"

// Backward compatibility alias
export type MenuItem = ActiveSection

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
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  seatCapacity: number
  // Date-based availability: bus won't appear in search on these dates
  unavailableDates?: string[] // YYYY-MM-DD
  // Seats permanently blocked by the operator (cannot be booked by passengers)
  naSeats?: string[]
  // Admin verification gate — new buses start as pending_verification
  verificationStatus?: BusVerificationStatus
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

export interface INotification {
  id: string
  type: "new_booking" | "cancellation" | "trip_alert" | "seat_warning"
  title: string
  message: string
  bookingId?: string
  read: boolean
  createdAt: any
  passengerName?: string
  busName?: string
  from?: string
  to?: string
  amount?: number
  isOnline?: boolean
}

export type BusType = "Micro" | "Hiace" | "Deluxe" | "AC Deluxe"
export type BusStatus = "Active" | "Maintenance" | "Inactive"
export type BusVerificationStatus = "pending_verification" | "approved" | "rejected" | "suspended"
export type BookingStatus = "Confirmed" | "Pending" | "Cancelled" | "Completed"

export interface IBookingService {
  createBooking(booking: Omit<IBooking, "id" | "bookingDate">): Promise<IBooking>
  getBookings(operatorId: string): Promise<IBooking[]>
  getBookingHistory(operatorId: string): Promise<IBooking[]>
  updateBooking(id: string, updates: Partial<IBooking>): Promise<IBooking>
  cancelBooking(id: string): Promise<void>
}

export interface IBusService {
  getBuses(operatorId: string): Promise<IBus[]>
  createBus(bus: Omit<IBus, "id">): Promise<IBus>
  updateBus(id: string, updates: Partial<IBus>): Promise<IBus>
  deleteBus(id: string): Promise<void>
  searchBuses(from: string, to: string, date: string, operatorId: string): Promise<IBus[]>
  getBusById(id: string): Promise<IBus | null>
  searchAllBuses(from: string, to: string, date: string): Promise<IBus[]>
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

// Payment taxonomy is owned by active-booking.service.ts so the service
// stays the single source of truth. Re-export here for the input shape.
import type { PaymentStatus, PaymentMode } from "../services/active-booking.service"

export interface IActiveBookingData {
  operatorId: string
  userId?: string
  busId: string
  busName: string
  busType: string
  from: string
  to: string
  date: string
  time: string
  /** @deprecated use seatNumbers */
  seatNumber?: string
  seatNumbers: string[]
  passengerName: string
  passengerPhone: string
  boardingPoint: string
  droppingPoint: string
  amount: number
  status: "booked" | "cancelled" | "completed"
  bookingTime: any
  // Optional on input — createActiveBooking() fills in defaults.
  paymentStatus?: PaymentStatus
  paymentMode?: PaymentMode | null
  paymentTxnId?: string | null
}
