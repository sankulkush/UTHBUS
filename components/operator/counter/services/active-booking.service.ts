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
  runTransaction,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// ── seatLocks helpers ─────────────────────────────────────────────────────────
// seatLocks/{busId_date_seatNumber} is a tiny PII-free record per booked seat.
// It exists to let anonymous users check seat availability without reading
// activeBookings (which holds passenger PII).

function seatLockId(busId: string, date: string, seatNumber: string): string {
  return `${busId}_${date}_${seatNumber}`;
}

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

// PNR format: AABB + YYMMDD + 6 random alphanumeric chars (14 chars total).
// 36^6 ≈ 2.1B suffixes per route/date pair. At 1000 bookings/route/day the
// birthday-paradox collision probability is ~2.4e-4. Negligible for MVP scale,
// which lets us generate PNRs without an existence check across activeBookings
// (such a check would require reading other users' bookings — disallowed by
// rules under the seatLocks design).
const PNR_RANDOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes 0/O/1/I to avoid misreads

function randomSuffix(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += PNR_RANDOM_ALPHABET[Math.floor(Math.random() * PNR_RANDOM_ALPHABET.length)];
  }
  return out;
}

function buildPNR(from: string, to: string, date: string): string {
  const fromCode = locationCode(from, 2);
  const toCode   = locationCode(to, 2);
  const [yStr = "", mStr = "", dStr = ""] = (date || "").split("-");
  const yearPart  = (yStr || "0000").slice(-2).padStart(2, "0");
  const monthPart = String(parseInt(mStr || "1", 10) || 1).padStart(2, "0");
  const dayPart   = String(parseInt(dStr || "1", 10) || 1).padStart(2, "0");
  return `${fromCode}${toCode}${yearPart}${monthPart}${dayPart}${randomSuffix(6)}`;
}

export class ActiveBookingsService {
  private col() {
    return collection(firestore, "activeBookings");
  }

  /** Look up a booking by its PNR. Returns null if not found.
   *  NOTE: rules require the caller to own the matching booking (user, operator,
   *  or admin). Anonymous PNR lookups are not supported. */
  async getByPNR(pnr: string): Promise<IActiveBooking | null> {
    const normalized = (pnr || "").trim().toUpperCase();
    if (!normalized) return null;
    const q = query(this.col(), where("pnr", "==", normalized));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { ...(d.data() as Omit<IActiveBooking, "id">), id: d.id };
  }

  /** Generate a PNR. High-entropy random suffix means we skip the cross-doc
   *  uniqueness check (which the user can't run under tightened rules anyway). */
  generatePNR(from: string, to: string, date: string): string {
    return buildPNR(from, to, date);
  }

  /** Create a new booking (supports multiple seats).
   *
   *  Runs as a single Firestore transaction that:
   *   1. Reads seatLocks for each requested seat. If any already exists, throws
   *      — that seat was just taken by a concurrent booker.
   *   2. Writes the activeBooking doc.
   *   3. Writes one seatLock doc per seat (deterministic ID = busId_date_seatNumber).
   *
   *  The rule on seatLocks/{id} requires the activeBooking referenced by
   *  bookingId to exist after the txn, with matching ownership and busId/date
   *  — closing the loophole where someone could lock seats without booking.
   */
  async createActiveBooking(
    booking: Omit<IActiveBooking, "id" | "createdAt" | "updatedAt" | "pnr"> & { pnr?: string }
  ): Promise<IActiveBooking> {
    const pnr = booking.pnr || this.generatePNR(booking.from, booking.to, booking.date);
    const seats = booking.seatNumbers || [];
    if (!seats.length) throw new Error("At least one seat is required.");

    const bookingRef = docRef(this.col());
    const bookingId = bookingRef.id;
    const lockRefs = seats.map((s) =>
      docRef(firestore, "seatLocks", seatLockId(booking.busId, booking.date, s))
    );

    await runTransaction(firestore, async (tx) => {
      const lockSnaps = await Promise.all(lockRefs.map((r) => tx.get(r)));
      const taken: string[] = [];
      lockSnaps.forEach((snap, i) => { if (snap.exists()) taken.push(seats[i]); });
      if (taken.length) {
        throw new Error(`Seat(s) just taken: ${taken.join(", ")}. Please pick different seats.`);
      }

      const bookingData = {
        ...booking,
        pnr,
        bookingTime: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      tx.set(bookingRef, bookingData);

      seats.forEach((seat, i) => {
        tx.set(lockRefs[i], {
          busId: booking.busId,
          date: booking.date,
          seatNumber: seat,
          bookingId,
          bookerUid: booking.userId || null,
          operatorId: booking.operatorId,
          createdAt: serverTimestamp(),
        });
      });
    });

    return { ...booking, pnr, id: bookingId };
  }

  /** Delete all seatLocks for a given booking. Safe to call multiple times;
   *  missing locks are no-ops. Used by cancellation. */
  private async releaseSeatLocks(busId: string, date: string, seats: string[]): Promise<void> {
    await Promise.all(
      seats.map(async (s) => {
        try {
          await deleteDoc(docRef(firestore, "seatLocks", seatLockId(busId, date, s)));
        } catch {
          // Lock didn't exist or was already freed — fine.
        }
      })
    );
  }

  /** Get all booked seat labels for a bus on a specific date.
   *  Reads from the PII-free seatLocks collection so this works for anonymous
   *  visitors (needed for the booking flow's seat availability check). */
  async getBookedSeats(busId: string, date: string): Promise<string[]> {
    const q = query(
      collection(firestore, "seatLocks"),
      where("busId", "==", busId),
      where("date", "==", date)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data().seatNumber as string);
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

  /** Cancel a booking. Flips status to "cancelled" AND releases the seatLocks
   *  so the seats become bookable again. */
  async cancelActiveBooking(id: string): Promise<void> {
    const ref = docRef(firestore, "activeBookings", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const data = snap.data() as IActiveBooking;
    await updateDoc(ref, { status: "cancelled", updatedAt: serverTimestamp() });
    const seats = data.seatNumbers && data.seatNumbers.length
      ? data.seatNumbers
      : (data.seatNumber ? [data.seatNumber] : []);
    if (seats.length) await this.releaseSeatLocks(data.busId, data.date, seats);
  }

  /** Hard-delete a booking. Also releases seatLocks. */
  async deleteActiveBooking(id: string): Promise<void> {
    const ref = docRef(firestore, "activeBookings", id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data() as IActiveBooking;
      const seats = data.seatNumbers && data.seatNumbers.length
        ? data.seatNumbers
        : (data.seatNumber ? [data.seatNumber] : []);
      if (seats.length) await this.releaseSeatLocks(data.busId, data.date, seats);
    }
    await deleteDoc(ref);
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

  /** Admin use: fetch every booking across all operators, newest first */
  async getAllBookingsForAdmin(): Promise<IActiveBooking[]> {
    const q = query(this.col(), orderBy("bookingTime", "desc"));
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
