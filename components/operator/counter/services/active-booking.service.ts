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
  /** @deprecated use seatNumbers */
  seatNumber?: string;
  seatNumbers: string[];
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
  private col() {
    return collection(firestore, "activeBookings");
  }

  /** Create a new booking (supports multiple seats) */
  async createActiveBooking(
    booking: Omit<IActiveBooking, "id" | "createdAt" | "updatedAt">
  ): Promise<IActiveBooking> {
    const bookingData = {
      ...booking,
      bookingTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(this.col(), bookingData);
    return { ...booking, id: ref.id };
  }

  /** Get all booked seat labels for a bus on a specific date.
   *  Handles both legacy docs (seatNumber: string) and new docs (seatNumbers: string[]). */
  async getBookedSeats(busId: string, date: string): Promise<string[]> {
    const q = query(
      this.col(),
      where("busId", "==", busId),
      where("date", "==", date),
      where("status", "==", "booked")
    );
    const snap = await getDocs(q);
    const booked: string[] = [];
    snap.docs.forEach((d) => {
      const data = d.data();
      if (Array.isArray(data.seatNumbers) && data.seatNumbers.length) {
        booked.push(...data.seatNumbers);
      } else if (data.seatNumber) {
        // legacy single-seat booking
        booked.push(data.seatNumber);
      }
    });
    return booked;
  }

  /** Check whether a single seat is still free */
  async isSeatAvailable(busId: string, date: string, seatNumber: string): Promise<boolean> {
    const booked = await this.getBookedSeats(busId, date);
    return !booked.includes(seatNumber);
  }

  /** Check whether ALL given seats are simultaneously free */
  async areSeatAvailable(busId: string, date: string, seats: string[]): Promise<boolean> {
    if (!seats.length) return false;
    const booked = await this.getBookedSeats(busId, date);
    return !seats.some((s) => booked.includes(s));
  }

  /** Get all active (booked-status) bookings for an operator */
  async getActiveBookings(operatorId: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("operatorId", "==", operatorId),
      where("status", "==", "booked"),
      orderBy("bookingTime", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Omit<IActiveBooking, "id">), id: d.id }));
  }

  /** Get ALL bookings for a user regardless of status */
  async getUserBookings(userId: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("userId", "==", userId),
      orderBy("bookingTime", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Omit<IActiveBooking, "id">), id: d.id }));
  }

  /** Get user bookings filtered by status */
  async getUserBookingsByStatus(
    userId: string,
    status: "booked" | "cancelled" | "completed"
  ): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("userId", "==", userId),
      where("status", "==", status),
      orderBy("bookingTime", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Omit<IActiveBooking, "id">), id: d.id }));
  }

  /** Update any fields on a booking */
  async updateActiveBooking(id: string, updates: Partial<IActiveBooking>): Promise<IActiveBooking> {
    const ref = docRef(firestore, "activeBookings", id);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    const updated = await getDoc(ref);
    return { ...(updated.data() as Omit<IActiveBooking, "id">), id: updated.id };
  }

  /** Cancel a booking */
  async cancelActiveBooking(id: string): Promise<void> {
    const ref = docRef(firestore, "activeBookings", id);
    await updateDoc(ref, { status: "cancelled", updatedAt: serverTimestamp() });
  }

  /** Hard-delete a booking */
  async deleteActiveBooking(id: string): Promise<void> {
    await deleteDoc(docRef(firestore, "activeBookings", id));
  }

  /** Fetch a single booking by ID */
  async getActiveBookingById(id: string): Promise<IActiveBooking | null> {
    const ref = docRef(firestore, "activeBookings", id);
    const d = await getDoc(ref);
    if (!d.exists()) return null;
    return { ...(d.data() as Omit<IActiveBooking, "id">), id: d.id };
  }

  /** All active bookings for a bus (any date) */
  async getBookingsForBus(busId: string): Promise<IActiveBooking[]> {
    const q = query(this.col(), where("busId", "==", busId), where("status", "==", "booked"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Omit<IActiveBooking, "id">), id: d.id }));
  }

  /** Active bookings for a bus on a specific date */
  async getBookingsForBusOnDate(busId: string, date: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("busId", "==", busId),
      where("date", "==", date),
      where("status", "==", "booked")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Omit<IActiveBooking, "id">), id: d.id }));
  }

  /** All bookings for an operator (all statuses) */
  async getOperatorBookings(operatorId: string): Promise<IActiveBooking[]> {
    const q = query(
      this.col(),
      where("operatorId", "==", operatorId),
      orderBy("bookingTime", "desc")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...(d.data() as Omit<IActiveBooking, "id">), id: d.id }));
  }
}
