import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { firestore } from '@/lib/firebase';

export interface ActiveBooking {
  id: string;
  operatorId: string;
  busId: string;
  userId: string;
  passengerName: string;
  passengerPhone: string;
  from: string;
  to: string;
  date: string;
  seatNumber: number;
  bookingTime: Timestamp;
  status: 'booked' | 'cancelled' | 'completed';
  price: number;
  busName?: string;
  departureTime?: string;
  arrivalTime?: string;
}

export interface BookingData {
  operatorId: string;
  busId: string;
  userId: string;
  passengerName: string;
  passengerPhone: string;
  from: string;
  to: string;
  date: string;
  seatNumber: number;
  price: number;
  busName?: string;
  departureTime?: string;
  arrivalTime?: string;
}

class BookingService {
  private collectionName = 'activeBookings';

  // Create a new booking
  async createActiveBooking(bookingData: BookingData): Promise<string> {
    try {
      const docRef = await addDoc(collection(firestore, this.collectionName), {
        ...bookingData,
        bookingTime: serverTimestamp(),
        status: 'booked'
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<ActiveBooking | null> {
    try {
      const docRef = doc(firestore, this.collectionName, bookingId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ActiveBooking;
      }
      return null;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }

  // Get bookings by user ID
  async getBookingsByUserId(userId: string): Promise<ActiveBooking[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName), 
        where('userId', '==', userId),
        orderBy('bookingTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActiveBooking[];
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }

  // Get bookings by operator ID
  async getBookingsByOperatorId(operatorId: string): Promise<ActiveBooking[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName), 
        where('operatorId', '==', operatorId),
        orderBy('bookingTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActiveBooking[];
    } catch (error) {
      console.error('Error getting operator bookings:', error);
      throw error;
    }
  }

  // Get bookings by bus ID
  async getBookingsByBusId(busId: string): Promise<ActiveBooking[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName), 
        where('busId', '==', busId),
        orderBy('bookingTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActiveBooking[];
    } catch (error) {
      console.error('Error getting bus bookings:', error);
      throw error;
    }
  }

  // Get booked seats for a specific bus and date
  async getBookedSeats(busId: string, date: string): Promise<number[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName), 
        where('busId', '==', busId),
        where('date', '==', date),
        where('status', '==', 'booked')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => doc.data().seatNumber);
    } catch (error) {
      console.error('Error getting booked seats:', error);
      throw error;
    }
  }

  // Update booking status
  async updateBookingStatus(bookingId: string, status: 'booked' | 'cancelled' | 'completed'): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, bookingId);
      await updateDoc(docRef, { status });
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string): Promise<void> {
    try {
      await this.updateBookingStatus(bookingId, 'cancelled');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }

  // Complete booking
  async completeBooking(bookingId: string): Promise<void> {
    try {
      await this.updateBookingStatus(bookingId, 'completed');
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }

  // Delete booking (permanent)
  async deleteBooking(bookingId: string): Promise<void> {
    try {
      const docRef = doc(firestore, this.collectionName, bookingId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting booking:', error);
      throw error;
    }
  }

  // Get all bookings (for admin)
  async getAllBookings(): Promise<ActiveBooking[]> {
    try {
      const q = query(
        collection(firestore, this.collectionName),
        orderBy('bookingTime', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActiveBooking[];
    } catch (error) {
      console.error('Error getting all bookings:', error);
      throw error;
    }
  }

  // Check if seat is available
  async isSeatAvailable(busId: string, date: string, seatNumber: number): Promise<boolean> {
    try {
      const bookedSeats = await this.getBookedSeats(busId, date);
      return !bookedSeats.includes(seatNumber);
    } catch (error) {
      console.error('Error checking seat availability:', error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();