// components/operator/counter/context/counter-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { OperatorProfile } from "@/contexts/auth-context";
import type { IBus, IBooking, IDashboardStats } from "../types/counter.types";
import { BusService } from "../services/bus.service";
import { BookingService } from "../services/booking.service";
import { DashboardService } from "../services/dashboard.service";
import { ActiveBookingsService } from "../services/active-booking.service";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  type DocumentData 
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// Active booking interface for Firestore
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
  seatNumber: string;
  passengerName: string;
  passengerPhone: string;
  boardingPoint: string;
  droppingPoint: string;
  amount: number;
  bookingTime: any; // Firestore timestamp
  status: "booked" | "cancelled" | "completed";
}

interface CounterContextType {
  operator: OperatorProfile | null;
  buses: IBus[];
  bookings: IBooking[];
  activeBookings: IActiveBooking[];
  dashboardStats: IDashboardStats | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  refreshActiveBookings: () => Promise<void>;
  // New methods for global search
  searchAllBuses: (from: string, to: string, date: string) => Promise<IBus[]>;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const { operator: authOperator, loading: authLoading } = useAuth();
  const [buses, setBuses] = useState<IBus[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [activeBookings, setActiveBookings] = useState<IActiveBooking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const busService = new BusService();
  const bookingService = new BookingService();
  const dashboardService = new DashboardService();
  const activeBookingsService = new ActiveBookingsService();

  // Fetch active bookings from Firestore
  const refreshActiveBookings = async () => {
    if (!authOperator) return;

    try {
      const q = query(
        collection(firestore, "activeBookings"),
        where("operatorId", "==", authOperator.uid),
        where("status", "==", "booked"),
        orderBy("bookingTime", "desc")
      );
      
      const snapshot = await getDocs(q);
      const bookingsData: IActiveBooking[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as IActiveBooking));
      
      setActiveBookings(bookingsData);
    } catch (error) {
      console.error("Error fetching active bookings:", error);
    }
  };

  // New method for global bus search
  const searchAllBuses = async (from: string, to: string, date: string): Promise<IBus[]> => {
    return await busService.searchAllBuses(from, to, date);
  };

  const refreshData = async () => {
    if (!authOperator) return;
    setLoading(true);

    try {
      const operatorId = authOperator.uid;
      const [busesData, bookingsData, statsData] = await Promise.all([
        busService.getBuses(operatorId),
        bookingService.getBookings(operatorId),
        dashboardService.getDashboardStats(operatorId),
      ]);

      setBuses(busesData);
      setBookings(bookingsData);
      setDashboardStats(statsData);
      
      // Also refresh active bookings
      await refreshActiveBookings();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authOperator && !authLoading) {
      refreshData();
    }
  }, [authOperator, authLoading]);

  return (
    <CounterContext.Provider
      value={{
        operator: authOperator,
        buses,
        bookings,
        activeBookings,
        dashboardStats,
        loading: loading || authLoading,
        refreshData,
        refreshActiveBookings,
        searchAllBuses,
      }}
    >
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const context = useContext(CounterContext);
  if (!context) {
    throw new Error("useCounter must be used within CounterProvider");
  }
  return context;
}