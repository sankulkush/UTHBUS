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
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { firestore as db } from "../lib/firebase";
import type { Bus, Operator } from "../lib/types";

// Collection references
const busesCol = collection(db, "buses");
const operatorsCol = collection(db, "operators");

// Bus CRUD operations
export const createBus = async (busData: Omit<Bus, "id" | "createdAt" | "updatedAt">) => {
  try {
    const docRef = await addDoc(busesCol, {
      ...busData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Get the created document to return full data
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Bus;
    }
    throw new Error("Failed to create bus");
  } catch (error) {
    console.error("Error creating bus:", error);
    throw error;
  }
};

export const listBusesByOperator = async (operatorId: string): Promise<Bus[]> => {
  try {
    const q = query(
      busesCol,
      where("operatorId", "==", operatorId),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as Bus));
  } catch (error) {
    console.error("Error fetching buses:", error);
    throw error;
  }
};

export const updateBus = async (id: string, data: Partial<Bus>) => {
  try {
    const busRef = doc(busesCol, id);
    await updateDoc(busRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    // Return updated document
    const docSnap = await getDoc(busRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Bus;
    }
    throw new Error("Failed to update bus");
  } catch (error) {
    console.error("Error updating bus:", error);
    throw error;
  }
};

export const deleteBus = async (id: string) => {
  try {
    const busRef = doc(busesCol, id);
    await deleteDoc(busRef);
  } catch (error) {
    console.error("Error deleting bus:", error);
    throw error;
  }
};

export const getBusById = async (id: string): Promise<Bus | null> => {
  try {
    const docSnap = await getDoc(doc(busesCol, id));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Bus;
    }
    return null;
  } catch (error) {
    console.error("Error fetching bus:", error);
    throw error;
  }
};

// Operator operations
export const getOperatorById = async (id: string): Promise<Operator | null> => {
  try {
    const docSnap = await getDoc(doc(operatorsCol, id));
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Operator;
    }
    return null;
  } catch (error) {
    console.error("Error fetching operator:", error);
    throw error;
  }
};