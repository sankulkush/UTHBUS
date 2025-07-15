// components/operator/counter/services/active-booking.service.ts

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  updateDoc,
  doc as docRef,
  getDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

export interface IActiveBooking {
  id?: string;
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
  createdAt?: any;
  updatedAt?: any;
}

export class ActiveBookingsService {
  /** Helper to reference the 'activeBookings' collection */
  private col() {
    return collection(firestore, "activeBookings");
  }

  /** Create a new active booking */
  async createActiveBooking(booking: Omit<IActiveBooking, "id" | "createdAt" | "updatedAt">): Promise<IActiveBooking> {
    const bookingData = {
      ...booking,
      bookingTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(this.col(), bookingData);
    return { ...booking, id: ref.id };
  }

  /** Get all active bookings for a specific operator */
  async getActiveBookings(operatorId: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("operatorId", "==", operatorId),
      where("status", "==", "booked"),
      orderBy("bookingTime", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<IActiveBooking, 'id'>;
      return { ...data, id: d.id };
    });
  }

  /** NEW: Get all active bookings for a specific user (passenger) */
  async getUserBookings(userId: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("userId", "==", userId),
      where("status", "==", "booked"),
      orderBy("bookingTime", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<IActiveBooking, 'id'>;
      return { ...data, id: d.id };
    });
  }

  /** NEW: Get booked seats for a specific bus on a specific date */
  async getBookedSeats(busId: string, date: string): Promise<string[]> {
    const q = query(
      this.col(),
      where("busId", "==", busId),
      where("date", "==", date),
      where("status", "==", "booked")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().seatNumber);
  }

  /** NEW: Check if a specific seat is available */
  async isSeatAvailable(busId: string, date: string, seatNumber: string): Promise<boolean> {
    const q = query(
      this.col(),
      where("busId", "==", busId),
      where("date", "==", date),
      where("seatNumber", "==", seatNumber),
      where("status", "==", "booked")
    );
    const snap = await getDocs(q);
    return snap.empty;
  }

  /** Update an active booking */
  async updateActiveBooking(id: string, updates: Partial<IActiveBooking>): Promise<IActiveBooking> {
    const bookingRef = docRef(firestore, "activeBookings", id);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(bookingRef, updateData);
    const updated = await getDoc(bookingRef);
    const data = updated.data() as Omit<IActiveBooking, 'id'>;
    return { ...data, id: updated.id };
  }

  /** Cancel an active booking */
  async cancelActiveBooking(id: string): Promise<void> {
    const bookingRef = docRef(firestore, "activeBookings", id);
    await updateDoc(bookingRef, {
      status: "cancelled",
      updatedAt: serverTimestamp(),
    });
  }

  /** Delete an active booking */
  async deleteActiveBooking(id: string): Promise<void> {
    const bookingRef = docRef(firestore, "activeBookings", id);
    await deleteDoc(bookingRef);
  }

  /** Get a specific active booking by ID */
  async getActiveBookingById(id: string): Promise<IActiveBooking | null> {
    const bookingRef = docRef(firestore, "activeBookings", id);
    const doc = await getDoc(bookingRef);
    if (doc.exists()) {
      const data = doc.data() as Omit<IActiveBooking, 'id'>;
      return { ...data, id: doc.id };
    }
    return null;
  }

  /** Get bookings for a specific bus */
  async getBookingsForBus(busId: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("busId", "==", busId),
      where("status", "==", "booked")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<IActiveBooking, 'id'>;
      return { ...data, id: d.id };
    });
  }

  /** NEW: Get bookings for a specific bus on a specific date */
  async getBookingsForBusOnDate(busId: string, date: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("busId", "==", busId),
      where("date", "==", date),
      where("status", "==", "booked")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<IActiveBooking, 'id'>;
      return { ...data, id: d.id };
    });
  }
}