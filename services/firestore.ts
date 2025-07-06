import {
  collection, doc, addDoc, getDoc, getDocs,
  updateDoc, deleteDoc, query, where
} from "firebase/firestore";
import { firestore as db } from "../lib/firebase";
import type { User, Operator, Bus, Route, Trip, ActiveBooking, PastBooking } from "../lib/types";

// COLLECTION REFERENCES
const usersCol    = collection(db, "users");
const oprsCol     = collection(db, "operators");
const busesCol    = collection(db, "buses");
const routesCol   = collection(db, "routes");
const tripsCol    = collection(db, "trips");
const actBookCol  = collection(db, "active-bookings");
const pastBookCol = collection(db, "past-bookings");

// GENERIC CRUD EXAMPLE
export const createBus = (b: Omit<Bus,"id">) => addDoc(busesCol, b);
export const listBuses = (from: string, to: string) => {
  const q = query(busesCol, where("startPoint","==",from), where("endPoint","==",to));
  return getDocs(q).then(snap => snap.docs.map(d => ({id:d.id, ...d.data()} as Bus)));
};
export const updateBus = (id: string, data: Partial<Bus>) => updateDoc(doc(busesCol, id), data);
export const deleteBus = (id: string) => deleteDoc(doc(busesCol, id));

// BOOKINGS
export const createBooking = (b: Omit<ActiveBooking,"id">) => addDoc(actBookCol, b);
export const listUserBookings = (uid: string) => {
  const q = query(actBookCol, where("userId","==",uid));
  return getDocs(q).then(s => s.docs.map(d => ({id:d.id, ...d.data()} as ActiveBooking)));
};
// ...and similarly for routes, trips, users, operators

// MOVE TO PAST BOOKING
export async function completeBooking(bookingId: string) {
  const bRef = doc(actBookCol, bookingId);
  const snap = await getDoc(bRef);
  const data = snap.data() as ActiveBooking;
  // copy to past-bookings
  await addDoc(pastBookCol, {
    ...data,
    completedAt: new Date().toISOString()
  } as PastBooking);
  // delete from active
  await deleteDoc(bRef);
}
