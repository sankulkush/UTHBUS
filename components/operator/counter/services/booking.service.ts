import type { IBookingService, IBooking } from "../types/counter.types"

// Real booking data storage
const realBookingData: IBooking[] = []

export class BookingService implements IBookingService {
  async createBooking(booking: Omit<IBooking, "id" | "bookingDate">): Promise<IBooking> {
    const newBooking: IBooking = {
      ...booking,
      id: `BK${String(realBookingData.length + 1).padStart(4, "0")}`,
      bookingDate: new Date().toISOString().split("T")[0],
    }
    realBookingData.push(newBooking)
    return newBooking
  }

  async getBookings(operatorId: string): Promise<IBooking[]> {
    return realBookingData.filter((booking) => booking.operatorId === operatorId && booking.status !== "Completed")
  }

  async getBookingHistory(operatorId: string): Promise<IBooking[]> {
    return realBookingData.filter((booking) => booking.operatorId === operatorId && booking.status === "Completed")
  }

  async updateBooking(id: string, updates: Partial<IBooking>): Promise<IBooking> {
    const bookingIndex = realBookingData.findIndex((booking) => booking.id === id)
    if (bookingIndex === -1) throw new Error("Booking not found")

    realBookingData[bookingIndex] = { ...realBookingData[bookingIndex], ...updates }
    return realBookingData[bookingIndex]
  }

  async cancelBooking(id: string): Promise<void> {
    const bookingIndex = realBookingData.findIndex((booking) => booking.id === id)
    if (bookingIndex === -1) throw new Error("Booking not found")

    realBookingData[bookingIndex].status = "Cancelled"
  }

  // Static method to get all bookings for dashboard stats
  static async getAllBookings(): Promise<IBooking[]> {
    return realBookingData
  }
}
