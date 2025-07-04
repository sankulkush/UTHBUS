// lib/services/busSearchService.ts
import { connectToDatabase } from '@/lib/database'
import { getBusesByRoute } from '@/lib/database/busQueries'

export interface BusSearchResult {
  id: string
  operatorId: string
  busNumber: string
  operatorName: string
  route: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  rating?: number
  amenities: string[]
  departureDate: string
  arrivalDate: string
  busType: string
  totalSeats: number
  availableSeats: number
  from: string
  to: string
  status: 'active' | 'inactive'
}

export class BusSearchService {
  /**
   * Search for available buses based on route and date
   */
  static async searchBuses(
    from: string,
    to: string,
    date: string
  ): Promise<BusSearchResult[]> {
    try {
      await connectToDatabase()
      // Use Firestore query for real data
      const buses = await getBusesByRoute(from, to, date)
      const searchResults = buses.map(bus => this.transformBusData(bus, from, to, date))
      return searchResults.filter(bus => bus.status === 'active')
    } catch (error) {
      console.error('Error in bus search:', error)
      throw new Error('Failed to search buses')
    }
  }

  /**
   * Get all active buses from all operators
   * Replace this with your actual database query
   */
  private static async getAllActiveBuses(): Promise<any[]> {
    return []
  }

  /**
   * Transform raw bus data to match the expected interface
   */
  private static transformBusData(
    bus: any,
    from: string,
    to: string,
    date: string
  ): BusSearchResult {
    return {
      id: bus._id || bus.id,
      operatorId: bus.operatorId,
      busNumber: bus.busNumber,
      operatorName: bus.operator?.name || 'Unknown Operator',
      route: bus.route || `${from} - ${to}`,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      duration: this.calculateDuration(bus.departureTime, bus.arrivalTime),
      price: bus.price,
      rating: bus.operator?.rating || 4.0,
      amenities: bus.amenities || [],
      departureDate: date,
      arrivalDate: this.getNextDay(date),
      busType: bus.busType,
      totalSeats: bus.totalSeats,
      availableSeats: bus.availableSeats || bus.totalSeats, // You can implement seat booking logic later
      from: from,
      to: to,
      status: bus.status === 'active' ? 'active' : 'inactive'
    }
  }

  /**
   * Calculate duration between departure and arrival times
   */
  private static calculateDuration(departureTime: string, arrivalTime: string): string {
    try {
      const [depHours, depMinutes] = departureTime.split(':').map(Number)
      const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number)
      
      let totalMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes)
      
      // If arrival is next day
      if (totalMinutes <= 0) {
        totalMinutes += 24 * 60
      }
      
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      
      return `${hours}h ${minutes}m`
    } catch (error) {
      return '0h 0m'
    }
  }

  /**
   * Get next day date string
   */
  private static getNextDay(dateString: string): string {
    const date = new Date(dateString)
    date.setDate(date.getDate() + 1)
    return date.toISOString().split('T')[0]
  }

  /**
   * Get available buses by operator
   */
  static async getBusesByOperator(operatorId: string): Promise<BusSearchResult[]> {
    try {
      await connectToDatabase()
      
      // TODO: Implement query to get buses by specific operator
      // Example:
      /*
      const buses = await Bus.find({ 
        operatorId: operatorId, 
        status: 'active' 
      }).populate('operatorId')
      */
      
      return []
    } catch (error) {
      console.error('Error fetching buses by operator:', error)
      throw new Error('Failed to fetch operator buses')
    }
  }

  /**
   * Get bus details by ID
   */
  static async getBusById(busId: string): Promise<BusSearchResult | null> {
    try {
      await connectToDatabase()
      
      // TODO: Implement query to get specific bus
      // Example:
      /*
      const bus = await Bus.findById(busId).populate('operatorId')
      if (!bus) return null
      
      return this.transformBusData(bus, bus.from, bus.to, new Date().toISOString().split('T')[0])
      */
      
      return null
    } catch (error) {
      console.error('Error fetching bus by ID:', error)
      throw new Error('Failed to fetch bus details')
    }
  }
}