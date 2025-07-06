// lib/database-service.ts
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface Bus {
  id?: string;
  operatorId: string;
  operatorName: string;
  busNumber: string;
  originCity: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  totalSeats: number;
  availableSeats: number;
  busType: string;
  amenities: string[];
  route?: string[];
  createdAt: Timestamp;
  isActive: boolean;
}

export interface Operator {
  id?: string;
  name: string;
  email: string;
  phone: string;
  totalBuses: number;
  createdAt: Timestamp;
  isVerified: boolean;
}

// Bus Operations
export const addBus = async (busData: Omit<Bus, 'id' | 'createdAt' | 'isActive'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'buses'), {
      ...busData,
      createdAt: Timestamp.now(),
      isActive: true
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding bus:', error);
    throw error;
  }
};

export const getAllBuses = async (): Promise<Bus[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'buses'));
    const buses: Bus[] = [];
    querySnapshot.forEach((doc) => {
      buses.push({ id: doc.id, ...doc.data() } as Bus);
    });
    return buses;
  } catch (error) {
    console.error('Error getting buses:', error);
    throw error;
  }
};

export const getBusesByOperator = async (operatorId: string): Promise<Bus[]> => {
  try {
    const q = query(
      collection(db, 'buses'), 
      where('operatorId', '==', operatorId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const buses: Bus[] = [];
    querySnapshot.forEach((doc) => {
      buses.push({ id: doc.id, ...doc.data() } as Bus);
    });
    return buses;
  } catch (error) {
    console.error('Error getting buses by operator:', error);
    throw error;
  }
};

export const searchBuses = async (
  originCity: string, 
  destinationCity: string, 
  date?: string
): Promise<Bus[]> => {
  try {
    const q = query(
      collection(db, 'buses'),
      where('originCity', '==', originCity),
      where('destinationCity', '==', destinationCity),
      where('isActive', '==', true)
    );
    
    const querySnapshot = await getDocs(q);
    const buses: Bus[] = [];
    querySnapshot.forEach((doc) => {
      buses.push({ id: doc.id, ...doc.data() } as Bus);
    });
    return buses;
  } catch (error) {
    console.error('Error searching buses:', error);
    throw error;
  }
};

export const updateBus = async (busId: string, updateData: Partial<Bus>): Promise<boolean> => {
  try {
    const busRef = doc(db, 'buses', busId);
    await updateDoc(busRef, updateData);
    return true;
  } catch (error) {
    console.error('Error updating bus:', error);
    throw error;
  }
};

export const deleteBus = async (busId: string): Promise<boolean> => {
  try {
    const busRef = doc(db, 'buses', busId);
    await updateDoc(busRef, { isActive: false });
    return true;
  } catch (error) {
    console.error('Error deleting bus:', error);
    throw error;
  }
};

// Operator Operations
export const addOperator = async (operatorData: Omit<Operator, 'id' | 'totalBuses' | 'createdAt' | 'isVerified'>): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'operators'), {
      ...operatorData,
      totalBuses: 0,
      createdAt: Timestamp.now(),
      isVerified: false
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding operator:', error);
    throw error;
  }
};

export const getOperatorById = async (operatorId: string): Promise<Operator | null> => {
  try {
    const docRef = doc(db, 'operators', operatorId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Operator;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting operator:', error);
    throw error;
  }
};

export const updateOperatorBusCount = async (operatorId: string, increment: boolean = true): Promise<void> => {
  try {
    const operatorRef = doc(db, 'operators', operatorId);
    const operatorDoc = await getDoc(operatorRef);
    
    if (operatorDoc.exists()) {
      const currentCount = operatorDoc.data().totalBuses || 0;
      const newCount = increment ? currentCount + 1 : Math.max(0, currentCount - 1);
      
      await updateDoc(operatorRef, { totalBuses: newCount });
    }
  } catch (error) {
    console.error('Error updating operator bus count:', error);
    throw error;
  }
};