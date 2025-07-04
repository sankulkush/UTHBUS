// lib/database/busQueries.ts
import { connectToDatabase } from '@/lib/database'
import { firestore } from '@/firebaseConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'

/**
 * Database query helper for bus operations
 * Adapt these functions to match your existing database schema
 */

export class BusQueries {
  /**
   * Get all active buses from all operators
   * This is the main function you need to implement based on your database structure
   */
  static async getAllActiveBuses() {
    try {
      await connectToDatabase()

      // OPTION 1: If you're using MongoDB/Mongoose
      /*
      const buses = await Bus.aggregate([
        {
          $match: { 
            status: 'active' 
          }
        },
        {
          $lookup: {
            from: 'operators', // Your operator collection name
            localField: 'operatorId',
            foreignField: '_id',
            as: 'operator'
          }
        },
        {
          $unwind: '$operator'
        },
        {
          $project: {
            _id: 1,
            operatorId: 1,
            busNumber: 1,
            busType: 1,
            totalSeats: 1,
            departureTime: 1,
            arrivalTime: 1,
            price: 1,
            amenities: 1,
            route: 1,
            status: 1,
            'operator.name': 1,
            'operator.rating': 1
          }
        }
      ])
      
      return buses
      */

      // OPTION 2: If you're using Prisma
      /*
      const buses = await prisma.bus.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          operator: {
            select: {
              name: true,
              rating: true
            }
          }
        }
      })
      
      return buses
      */

      // OPTION 3: If you're using raw SQL queries
      /*
      const query = `
        SELECT 
          b.id,
          b.operator_id,
          b.bus_number,
          b.bus_type,
          b.total_seats,
          b.departure_time,
          b.arrival_time,
          b.price,
          b.amenities,
          b.route,
          b.status,
          o.name as operator_name,
          o.rating as operator_rating
        FROM buses b
        INNER JOIN operators o ON b.operator_id = o.id
        WHERE b.status = 'active'
        ORDER BY b.departure_time
      `
      
      const result = await db.query(query)
      return result.rows
      */

      // For now, return empty array - you'll replace this with your actual query
      return []
      
    } catch (error) {
      console.error('Error fetching buses:', error)
      throw error
    }
  }

  /**
   * Get buses by specific operator
   */
  static async getBusesByOperator(operatorId: string) {
    try {
      await connectToDatabase()

      // Example implementations:
      
      // MongoDB/Mongoose:
      /*
      const buses = await Bus.find({ 
        operatorId: new mongoose.Types.ObjectId(operatorId),
        status: 'active' 
      }).populate('operatorId', 'name rating')
      
      return buses
      */

      // Prisma:
      /*
      const buses = await prisma.bus.findMany({
        where: {
          operatorId: operatorId,
          status: 'ACTIVE'
        },
        include: {
          operator: true
        }
      })
      
      return buses
      */

      return []
    } catch (error) {
      console.error('Error fetching buses by operator:', error)
      throw error
    }
  }

  /**
   * Get bus by ID
   */
  static async getBusById(busId: string) {
    try {
      await connectToDatabase()

      // MongoDB/Mongoose:
      /*
      const bus = await Bus.findById(busId).populate('operatorId')
      return bus
      */

      // Prisma:
      /*
      const bus = await prisma.bus.findUnique({
        where: { id: busId },
        include: { operator: true }
      })
      
      return bus
      */

      return null
    } catch (error) {
      console.error('Error fetching bus by ID:', error)
      throw error
    }
  }

  /**
   * Update bus seat availability
   */
  static async updateSeatAvailability(busId: string, seatsToBook: number) {
    try {
      await connectToDatabase()

      // MongoDB/Mongoose:
      /*
      const bus = await Bus.findByIdAndUpdate(
        busId,
        { $inc: { availableSeats: -seatsToBook } },
        { new: true }
      )
      
      return bus
      */

      // Prisma:
      /*
      const bus = await prisma.bus.update({
        where: { id: busId },
        data: {
          availableSeats: {
            decrement: seatsToBook
          }
        }
      })
      
      return bus
      */

      return null
    } catch (error) {
      console.error('Error updating seat availability:', error)
      throw error
    }
  }

  /**
   * Get buses by route (when you implement route filtering)
   */
  static async getBusesByRoute(from: string, to: string, date: string) {
    try {
      await connectToDatabase()

      // Firestore query: buses where from, to, departureDate, and status match
      const busesRef = collection(firestore, 'buses')
      const q = query(
        busesRef,
        where('from', '==', from),
        where('to', '==', to),
        where('departureDate', '==', date),
        where('status', '==', 'active')
      )
      const snapshot = await getDocs(q)
      const buses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      // Optionally, fetch operator info if needed (not joined in Firestore, so you may need a second query)
      return buses
    } catch (error) {
      console.error('Error fetching buses by route:', error)
      throw error
    }
  }
}

// Export individual functions for easier importing
export const {
  getAllActiveBuses,
  getBusesByOperator,
  getBusById,
  updateSeatAvailability,
  getBusesByRoute
} = BusQueries