import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import type { IBus, IBusService, BusType } from '../types/counter.types';

export class BusService implements IBusService {
  async getBuses(operatorId: string): Promise<IBus[]> {
    const busesRef = collection(firestore, 'buses');
    const q = query(busesRef, where('operatorId', '==', operatorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IBus));
  }

  async createBus(bus: Omit<IBus, "id">): Promise<IBus> {
    const busesRef = collection(firestore, 'buses');
    const docRef = await addDoc(busesRef, {
      ...bus,
      createdAt: new Date().toISOString()
    });
    
    return {
      id: docRef.id,
      ...bus
    };
  }

  async updateBus(id: string, updates: Partial<IBus>): Promise<IBus> {
    const busRef = doc(firestore, 'buses', id);
    await updateDoc(busRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    return {
      id,
      ...updates
    } as IBus;
  }

  async deleteBus(id: string): Promise<void> {
    const busRef = doc(firestore, 'buses', id);
    await deleteDoc(busRef);
  }

  async searchBuses(from: string, to: string, date: string): Promise<IBus[]> {
    const busesRef = collection(firestore, 'buses');
    const q = query(
      busesRef,
      where('startPoint', '==', from),
      where('endPoint', '==', to),
      where('status', '==', 'Active')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IBus));
  }

  static async getAllActiveBuses(): Promise<IBus[]> {
    const busesRef = collection(firestore, 'buses');
    const q = query(busesRef, where('status', '==', 'Active'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as IBus));
  }
}