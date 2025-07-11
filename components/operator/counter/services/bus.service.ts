// components/operator/counter/services/bus.service.ts

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
  type DocumentData,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { IBusService, IBus } from "../types/counter.types";

export class BusService implements IBusService {
  /** Helper to reference the 'buses' collection */
  private col() {
    return collection(firestore, "buses");
  }

  /** Fetch all buses for a specific operator */
  async getBuses(operatorId: string): Promise<IBus[]> {
    const q = query(this.col(), where("operatorId", "==", operatorId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<IBus, 'id'>;
      return { ...data, id: d.id };
    });
  }

  /** Create a new bus document */
  async createBus(bus: Omit<IBus, "id">): Promise<IBus> {
    const ref = await addDoc(this.col(), bus);
    return { ...bus, id: ref.id };
  }

  /** Update an existing bus */
  async updateBus(id: string, updates: Partial<IBus>): Promise<IBus> {
    const busRef = docRef(firestore, "buses", id);
    await updateDoc(busRef, updates);
    const updated = await getDoc(busRef);
    const data = updated.data() as Omit<IBus, 'id'>;
    return { ...data, id: updated.id };
  }

  /** Delete a bus by ID */
  async deleteBus(id: string): Promise<void> {
    const busRef = docRef(firestore, "buses", id);
    await deleteDoc(busRef);
  }

  /** Search buses matching origin, destination, and active status */
  async searchBuses(from: string, to: string, date: string): Promise<IBus[]> {
    const q = query(
      this.col(),
      where("startPoint", "==", from),
      where("endPoint", "==", to),
      where("status", "==", "Active")
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Omit<IBus, 'id'>;
      return { ...data, id: d.id };
    });
  }
}
