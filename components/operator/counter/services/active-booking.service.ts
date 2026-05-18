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
  /** Passenger-facing reference (e.g. "KAPO26051801"). 12 chars:
   *  2-letter origin code + 2-letter destination code + 2-digit year (YY) +
   *  2-digit month (MM) + 2-digit day (DD) + 2-digit per-operator sequence (SS).
   *  Optional on the interface for backward-compatibility with legacy bookings,
   *  but every booking created through createActiveBooking() will have one. */
  pnr?: string;
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

// ── PNR helpers ────────────────────────────────────────────────────────────────

/** Strip everything non-alphabetic, uppercase, then take the first N chars
 *  padded with 'X' so we always get a fixed-width chunk. */
function locationCode(s: string, n = 2): string {
  const cleaned = (s || "").replace(/[^A-Za-z]/g, "").toUpperCase();
  return (cleaned.slice(0, n) || "X".repeat(n)).padEnd(n, "X");
}

/** Build a candidate PNR from its parts. Always 12 chars: AABB + YYMMDD + SS.
 *  Encoding the full date (year + month + day) prevents same-route same-day
 *  collisions across months/years — e.g. May 18 and April 18 produce
 *  different PNRs without relying on the uniqueness-retry fallback. */
function buildPNR(from: string, to: string, date: string, sequence: number): string {
  const fromCode = locationCode(from, 2);
  const toCode   = locationCode(to, 2);
  const [yStr = "", mStr = "", dStr = ""] = (date || "").split("-");
  const yearPart  = (yStr || "0000").slice(-2).padStart(2, "0");
  const monthPart = String(parseInt(mStr || "1", 10) || 1).padStart(2, "0");
  const dayPart   = String(parseInt(dStr || "1", 10) || 1).padStart(2, "0");
  const seqPart   = String(((sequence % 100) + 100) % 100).padStart(2, "0");
  return `${fromCode}${toCode}${yearPart}${monthPart}${dayPart}${seqPart}`;
}

export class ActiveBookingsService {
  private col() {
    return collection(firestore, "activeBookings");
  }

  /** Count this operator's bookings on a given travel date — used to seed PNR sequence. */
  private async countOperatorBookingsOnDate(operatorId: string, date: string): Promise<number> {
    const q = query(
      this.col(),
      where("operatorId", "==", operatorId),
      where("date", "==", date)
    );
    const snap = await getDocs(q);
    return snap.size;
  }

  /** Check whether a PNR is already taken. */
  async pnrExists(pnr: string): Promise<boolean> {
    const q = query(this.col(), where("pnr", "==", pnr));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  /** Look up a booking by its PNR. Returns null if not found. */
  async getByPNR(pnr: string): Promise<IActiveBooking | null> {
    const normalized = (pnr || "").trim().toUpperCase();
    if (!normalized) return null;
    const q = query(this.col(), where("pnr", "==", normalized));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { ...(d.data() as Omit<IActiveBooking, "id">), id: d.id };
  }

  /** Generate a unique PNR for a booking.
   *  Sequence starts from this operator's booking count for the same travel date,
   *  so it encodes "how many bookings the operator has had that day".
   *  Falls back to random sequence (then fully random) on collision. */
  async generatePNR(operatorId: string, from: string, to: string, date: string): Promise<string> {
    const baseSequence = (await this.countOperatorBookingsOnDate(operatorId, date)) + 1;

    // First pass: deterministic sequence, then random sequence on collision.
    for (let attempt = 0; attempt < 20; attempt++) {
      const seq = attempt === 0 ? baseSequence : Math.floor(Math.random() * 100);
      const pnr = buildPNR(from, to, date, seq);
      if (!(await this.pnrExists(pnr))) return pnr;
    }

    // Last resort — fully random PNR (still 12 chars: 4 letters + 8 digits)
    // so length is consistent across deterministic and fallback paths. Hardly
    // ever expected to hit — would require 20+ collisions on this route/date.
    for (let attempt = 0; attempt < 10; attempt++) {
      const rand = (len: number, alphabet: string) =>
        Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
      const pnr = rand(4, "ABCDEFGHJKLMNPQRSTUVWXYZ") + rand(8, "0123456789");
      if (!(await this.pnrExists(pnr))) return pnr;
    }
    throw new Error("Could not generate a unique PNR — please retry.");
  }

  /** Create a new booking (supports multiple seats). Generates a unique PNR. */
  async createActiveBooking(
    booking: Omit<IActiveBooking, "id" | "createdAt" | "updatedAt" | "pnr"> & { pnr?: string }
  ): Promise<IActiveBooking> {
    const pnr = booking.pnr
      || await this.generatePNR(booking.operatorId, booking.from, booking.to, booking.date);

    const bookingData = {
      ...booking,
      pnr,
      bookingTime: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(this.col(), bookingData);
    return { ...booking, pnr, id: ref.id };
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

  /** Returns true when a 'booked' booking's departure datetime has already passed. */
  static isDeparturePast(booking: IActiveBooking): boolean {
    if (booking.status !== "booked") return false;
    try {
      const [y, m, d] = booking.date.split("-").map(Number);
      const [h, min] = (booking.time || "00:00").split(":").map(Number);
      return new Date(y, m - 1, d, h, min) < new Date();
    } catch {
      return false;
    }
  }

  /** Marks any 'booked' bookings whose departure has passed as 'completed' in
   *  Firestore, then returns the same array with those statuses already updated.
   *  Safe to call on every page load — it's a no-op when nothing is stale. */
  async autoCompletePastBookings(bookings: IActiveBooking[]): Promise<IActiveBooking[]> {
    const past = bookings.filter((b) => ActiveBookingsService.isDeparturePast(b));
    if (past.length) {
      await Promise.all(
        past.map((b) => this.updateActiveBooking(b.id!, { status: "completed" }))
      );
    }
    return bookings.map((b) =>
      past.find((p) => p.id === b.id) ? { ...b, status: "completed" as const } : b
    );
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
