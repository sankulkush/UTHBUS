"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context" // Import your new auth context
import type { OperatorProfile } from "@/contexts/auth-context" // Import the correct type
import type { IBus, IBooking, IDashboardStats } from "../types/counter.types"
import { BookingService } from "../services/booking.service"
import { BusService } from "../services/bus.service"
import { DashboardService } from "../services/dashboard.service"

interface CounterContextType {
  operator: OperatorProfile | null // Change to match auth context type
  buses: IBus[]
  bookings: IBooking[]
  dashboardStats: IDashboardStats | null
  loading: boolean
  refreshData: () => Promise<void>
}

const CounterContext = createContext<CounterContextType | undefined>(undefined)

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const { operator: authOperator, loading: authLoading } = useAuth() // Use the auth context
  const [buses, setBuses] = useState<IBus[]>([])
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const busService = new BusService()
  const bookingService = new BookingService()
  const dashboardService = new DashboardService()

  const refreshData = async () => {
    if (!authOperator) return

    try {
      setLoading(true)
      // Use uid instead of id for OperatorProfile
      const operatorId = authOperator.uid
      const [busesData, bookingsData, statsData] = await Promise.all([
        busService.getBuses(operatorId),
        bookingService.getBookings(operatorId),
        dashboardService.getDashboardStats(operatorId),
      ])

      setBuses(busesData)
      setBookings(bookingsData)
      setDashboardStats(statsData)
    } catch (error) {
      console.error("Error refreshing data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authOperator && !authLoading) {
      refreshData()
    }
  }, [authOperator, authLoading])

  return (
    <CounterContext.Provider
      value={{
        operator: authOperator, // Use operator from auth context
        buses,
        bookings,
        dashboardStats,
        loading: loading || authLoading,
        refreshData,
      }}
    >
      {children}
    </CounterContext.Provider>
  )
}

export function useCounter() {
  const context = useContext(CounterContext)
  if (context === undefined) {
    throw new Error("useCounter must be used within a CounterProvider")
  }
  return context
}