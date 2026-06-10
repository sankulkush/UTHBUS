"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useOperatorAuth } from "@/contexts/operator-auth-context";
import type { OperatorProfile } from "@/contexts/operator-auth-context";
import type { IBus, IBooking, IDashboardStats, INotification } from "../types/counter.types";
import { BusService } from "../services/bus.service";
import { BookingService } from "../services/booking.service";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { firestore } from "@/lib/firebase";

// Single source of truth lives in the service; re-export here so existing
// `import type { IActiveBooking } from "../context/counter-context"` callsites
// don't break. Keeps Sprint 1's paymentStatus / paymentMode / paymentTxnId /
// paidAt fields automatically available everywhere.
import type { IActiveBooking } from "../services/active-booking.service";
export type { IActiveBooking };

interface CounterContextType {
  operator: OperatorProfile | null;
  buses: IBus[];
  bookings: IBooking[];
  activeBookings: IActiveBooking[];
  dashboardStats: IDashboardStats | null;
  notifications: INotification[];
  unreadCount: number;
  loading: boolean;
  refreshData: () => Promise<void>;
  refreshActiveBookings: () => Promise<void>;
  searchAllBuses: (from: string, to: string, date: string) => Promise<IBus[]>;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

const CounterContext = createContext<CounterContextType | undefined>(undefined);

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const { operator: authOperator, loading: authLoading } = useOperatorAuth();
  const [buses, setBuses] = useState<IBus[]>([]);
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [activeBookings, setActiveBookings] = useState<IActiveBooking[]>([]);
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats | null>(null);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loading, setLoading] = useState(true);

  const busService = new BusService();
  const bookingService = new BookingService();
  const initialLoadDone = useRef(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const refreshActiveBookings = async () => {
    if (!authOperator) return;
    try {
      // No server-side orderBy here — sort client-side to avoid the
      // composite (operatorId + bookingTime) Firestore index requirement
      // that can fail silently in production.
      const q = query(
        collection(firestore, "activeBookings"),
        where("operatorId", "==", authOperator.uid)
      );
      const snapshot = await getDocs(q);
      const data: IActiveBooking[] = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as IActiveBooking))
        .sort((a: any, b: any) => {
          const ta = a.bookingTime?.toMillis?.() ?? 0;
          const tb = b.bookingTime?.toMillis?.() ?? 0;
          return tb - ta;
        });
      setActiveBookings(data);
    } catch (error) {
      console.error("Error fetching active bookings:", error);
    }
  };

  const computeDashboardStats = async (operatorId: string): Promise<IDashboardStats> => {
    try {
      const today = (() => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })();

      const [allBookingsSnap, allBusesSnap] = await Promise.all([
        getDocs(query(
          collection(firestore, "activeBookings"),
          where("operatorId", "==", operatorId)
        )),
        getDocs(query(
          collection(firestore, "buses"),
          where("operatorId", "==", operatorId)
        )),
      ]);

      const allBookings = allBookingsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));
      const allBuses = allBusesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as any));

      const todayBookings = allBookings.filter(
        (b: any) => b.date === today && b.status !== "cancelled"
      );
      const monthStart = today.substring(0, 7); // YYYY-MM
      const monthBookings = allBookings.filter(
        (b: any) => b.date?.startsWith(monthStart) && b.status !== "cancelled"
      );

      return {
        todayBookings: todayBookings.length,
        pendingDepartures: todayBookings.filter((b: any) => b.status === "booked").length,
        todayRevenue: todayBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
        monthlyRevenue: monthBookings.reduce((sum: number, b: any) => sum + (b.amount || 0), 0),
        totalBuses: allBuses.length,
        activeBuses: allBuses.filter((b: any) => b.status === "Active").length,
      };
    } catch {
      return { todayBookings: 0, pendingDepartures: 0, todayRevenue: 0, monthlyRevenue: 0, totalBuses: 0, activeBuses: 0 };
    }
  };

  const refreshData = async () => {
    if (!authOperator) return;
    setLoading(true);
    try {
      const [busesData, bookingsData, stats] = await Promise.all([
        busService.getBuses(authOperator.uid),
        bookingService.getBookings(authOperator.uid),
        computeDashboardStats(authOperator.uid),
      ]);
      setBuses(busesData);
      setBookings(bookingsData);
      setDashboardStats(stats);
      await refreshActiveBookings();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchAllBuses = async (from: string, to: string, date: string): Promise<IBus[]> => {
    return busService.searchAllBuses(from, to, date);
  };

  // Real-time listener — keeps both notifications AND activeBookings live so
  // the dashboard's today's-bookings/revenue stats stay accurate without a
  // manual refresh.
  //
  // Intentionally avoids `orderBy + limit` on the server: that requires a
  // composite Firestore index (operatorId + bookingTime) which can fail
  // silently in production and break the listener. Sorting/trimming is done
  // client-side instead.
  useEffect(() => {
    if (!authOperator || authLoading) return;
    initialLoadDone.current = false;

    const q = query(
      collection(firestore, "activeBookings"),
      where("operatorId", "==", authOperator.uid)
    );

    const sortByTimeDesc = (a: any, b: any) => {
      const ta = a.bookingTime?.toMillis?.() ?? 0;
      const tb = b.bookingTime?.toMillis?.() ?? 0;
      return tb - ta;
    };

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        // Always sync activeBookings from the snapshot so derived stats are live
        const allBookings: IActiveBooking[] = snap.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as any) } as IActiveBooking))
          .sort(sortByTimeDesc);
        setActiveBookings(allBookings);

        if (!initialLoadDone.current) {
          // First load: show recent N as already-read history
          const initial: INotification[] = allBookings.slice(0, 40).map((b: any) => {
            const seats = b.seatNumbers?.join(", ") || b.seatNumber || "—";
            return {
              id: b.id,
              type: "new_booking" as const,
              title: b.userId ? "Online Booking" : "Counter Booking",
              message: `${b.passengerName} · ${seats} · ${b.busName} · ${b.from} → ${b.to}`,
              bookingId: b.id,
              read: true,
              createdAt: b.bookingTime,
              passengerName: b.passengerName,
              busName: b.busName,
              from: b.from,
              to: b.to,
              amount: b.amount,
              isOnline: !!b.userId,
            };
          });
          setNotifications(initial);
          initialLoadDone.current = true;
          return;
        }

        // Subsequent real-time changes — surface a notification for new bookings
        snap.docChanges().forEach((change) => {
          if (change.type === "added") {
            const d = change.doc.data() as any;
            const seats = d.seatNumbers?.join(", ") || d.seatNumber || "—";
            const isOnline = !!d.userId;
            const newNotif: INotification = {
              id: change.doc.id,
              type: "new_booking",
              title: isOnline ? "New Online Booking" : "New Counter Booking",
              message: `${d.passengerName} booked ${seats} on ${d.busName} (${d.from} → ${d.to})`,
              bookingId: change.doc.id,
              read: false,
              createdAt: d.bookingTime,
              passengerName: d.passengerName,
              busName: d.busName,
              from: d.from,
              to: d.to,
              amount: d.amount,
              isOnline,
            };
            setNotifications((prev) => [newNotif, ...prev]);
          }
        });
      },
      (err) => {
        // Surface listener errors so we don't fail silently
        console.error("activeBookings listener error:", err);
      }
    );

    return () => unsubscribe();
  }, [authOperator, authLoading]);

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
        notifications,
        unreadCount,
        loading: loading || authLoading,
        refreshData,
        refreshActiveBookings,
        searchAllBuses,
        markNotificationRead,
        markAllRead,
      }}
    >
      {children}
    </CounterContext.Provider>
  );
}

export function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error("useCounter must be used within CounterProvider");
  return ctx;
}
