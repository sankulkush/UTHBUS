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
  serverTimestamp,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";
import type { IBusService, IBus } from "../types/counter.types";

export class BusService implements IBusService {
  private col() {
    return collection(firestore, "buses");
  }

  async getBuses(operatorId: string): Promise<IBus[]> {
    const q = query(this.col(), where("operatorId", "==", operatorId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data() as Omit<IBus, "id">, id: d.id }));
  }

  async createBus(bus: Omit<IBus, "id">): Promise<IBus> {
    // Denormalise the operator's current KYC status onto the bus so user search
    // can gate on operator approval without a join (Sprint 2). Defaults to
    // pending if the operator doc is missing the field.
    let operatorKycStatus: IBus["operatorKycStatus"] = "pending_verification";
    let operatorActive = true;
    try {
      const opSnap = await getDoc(docRef(firestore, "operators", bus.operatorId));
      if (opSnap.exists()) {
        operatorKycStatus = (opSnap.data().kycStatus as IBus["operatorKycStatus"]) ?? "pending_verification";
        operatorActive = opSnap.data().accountStatus !== "suspended";
      }
    } catch {
      /* fall back to pending — admin approval re-stamps it anyway */
    }

    // New buses require UthBus admin approval before going live.
    const busData = {
      ...bus,
      status: "Inactive" as const,
      verificationStatus: "pending_verification" as const,
      operatorKycStatus,
      operatorActive,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(this.col(), busData);
    return { ...busData, id: ref.id };
  }

  async updateBus(id: string, updates: Partial<IBus>): Promise<IBus> {
    const ref = docRef(firestore, "buses", id);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
    const updated = await getDoc(ref);
    return { ...updated.data() as Omit<IBus, "id">, id: updated.id };
  }

  async deleteBus(id: string): Promise<void> {
    await deleteDoc(docRef(firestore, "buses", id));
  }

  async searchBuses(from: string, to: string, date: string, operatorId: string): Promise<IBus[]> {
    const q = query(
      this.col(),
      where("operatorId", "==", operatorId),
      where("startPoint", "==", from),
      where("endPoint", "==", to),
      where("status", "==", "Active")
    );
    const snap = await getDocs(q);
    const buses = snap.docs.map((d) => ({ ...d.data() as Omit<IBus, "id">, id: d.id }));
    return buses.filter((b) => !b.unavailableDates?.includes(date));
  }

  async searchAllBuses(from: string, to: string, date: string): Promise<IBus[]> {
    const q = query(
      this.col(),
      where("startPoint", "==", from),
      where("endPoint", "==", to),
      where("status", "==", "Active")
    );
    const snap = await getDocs(q);
    const buses = snap.docs.map((d) => ({ ...d.data() as Omit<IBus, "id">, id: d.id }));
    return buses.filter((b) => {
      // Only show admin-approved buses (or legacy buses without the field)
      if (b.verificationStatus && b.verificationStatus !== "approved") return false;
      // ...whose operator has passed KYC (Sprint 2). Legacy buses without the
      // denormalised field are treated as approved so nothing pre-KYC vanishes.
      if (b.operatorKycStatus && b.operatorKycStatus !== "approved") return false;
      // ...and whose operator account isn't suspended (only an explicit false hides).
      if (b.operatorActive === false) return false;
      return !b.unavailableDates?.includes(date);
    });
  }

  async getBusById(id: string): Promise<IBus | null> {
    const ref = docRef(firestore, "buses", id);
    const doc = await getDoc(ref);
    if (!doc.exists()) return null;
    return { ...doc.data() as Omit<IBus, "id">, id: doc.id };
  }

  async getAllBuses(): Promise<IBus[]> {
    const q = query(this.col(), where("status", "==", "Active"));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data() as Omit<IBus, "id">, id: d.id }));
  }

  /** Admin use: fetch all buses regardless of status/verification */
  async getAllBusesForAdmin(): Promise<IBus[]> {
    const snap = await getDocs(this.col());
    return snap.docs.map((d) => ({ ...d.data() as Omit<IBus, "id">, id: d.id }));
  }

  async verifyBus(id: string, status: "approved" | "rejected"): Promise<void> {
    const ref = docRef(firestore, "buses", id);
    await updateDoc(ref, {
      verificationStatus: status,
      ...(status === "approved" ? { status: "Active" } : {}),
      updatedAt: serverTimestamp(),
    });
  }

  async holdBus(id: string): Promise<void> {
    const ref = docRef(firestore, "buses", id);
    await updateDoc(ref, { verificationStatus: "suspended", status: "Inactive", updatedAt: serverTimestamp() });
  }

  async unholdBus(id: string): Promise<void> {
    const ref = docRef(firestore, "buses", id);
    await updateDoc(ref, { verificationStatus: "approved", status: "Active", updatedAt: serverTimestamp() });
  }

  async adminDeleteBus(id: string): Promise<void> {
    await deleteDoc(docRef(firestore, "buses", id));
  }
}
