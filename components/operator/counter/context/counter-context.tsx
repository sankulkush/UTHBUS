// components/operator/counter/context/counter-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { OperatorProfile } from "@/contexts/auth-context";
import type { IBus, IBooking, IDashboardStats } from "../types/counter.types";
import { BusService } from "../services/bus.service";
import { BookingService } from "../services/booking.service";
import { DashboardService } from "../services/dashboard.service";

interface CounterContextType {
  operator: OperatorProfile | null;
  buses: IBus[];
  bookings: IBooking[];
  dashboardStats: IDashboardStats | null;
  loading: boolean;
  refreshData: () => Promise<void>;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const { operator: authOperator, loading: authLoading } = useAuth();
  const [buses, setBuses] = useState<IBus[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const busService = new BusService();
  const bookingService = new BookingService();
  const dashboardService = new DashboardService();

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
        dashboardStats,
        loading: loading || authLoading,
        refreshData,
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
