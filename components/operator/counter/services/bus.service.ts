import { createBus, listBusesByOperator, updateBus, deleteBus, getBusById } from '../../../../services/firestore';
import type { Bus } from '../../../../lib/types';

export class BusService {
  async createBus(busData: Omit<Bus, "id" | "createdAt" | "updatedAt">) {
    return await createBus(busData);
  }

  async getBusesByOperator(operatorId: string) {
    return await listBusesByOperator(operatorId);
  }

  async updateBus(id: string, data: Partial<Bus>) {
    return await updateBus(id, data);
  }

  async deleteBus(id: string) {
    return await deleteBus(id);
  }

  async getBusById(id: string) {
    return await getBusById(id);
  }
}