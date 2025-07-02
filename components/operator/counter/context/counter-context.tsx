"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import type { IOperator, IBus, IBooking, IDashboardStats } from "../types/counter.types"
import { BookingService } from "../services/booking.service"
import { BusService } from "../services/bus.service"
import { DashboardService } from "../services/dashboard.service"
import { AuthService } from "../services/auth.service"

interface CounterContextType {
  operator: IOperator | null
  buses: IBus[]
  bookings: IBooking[]
  dashboardStats: IDashboardStats | null
  loading: boolean
  refreshData: () => Promise<void>
}

const CounterContext = createContext<CounterContextType | undefined>(undefined)

export function CounterProvider({ children }: { children: React.ReactNode }) {
  const [operator, setOperator] = useState<IOperator | null>(null)
  const [buses, setBuses] = useState<IBus[]>([])
  const [bookings, setBookings] = useState<IBooking[]>([])
  const [dashboardStats, setDashboardStats] = useState<IDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  const authService = new AuthService()
  const busService = new BusService()
  const bookingService = new BookingService()
  const dashboardService = new DashboardService()

  const refreshData = async () => {
    if (!operator) return

    try {
      setLoading(true)
      const [busesData, bookingsData, statsData] = await Promise.all([
        busService.getBuses(operator.id),
        bookingService.getBookings(operator.id),
        dashboardService.getDashboardStats(operator.id),
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
    const initializeOperator = async () => {
      try {
        const currentOperator = await authService.getCurrentOperator()
        setOperator(currentOperator)
      } catch (error) {
        console.error("Error getting current operator:", error)
      }
    }

    initializeOperator()
  }, [])

  useEffect(() => {
    if (operator) {
      refreshData()
    }
  }, [operator])

  return (
    <CounterContext.Provider
      value={{
        operator,
        buses,
        bookings,
        dashboardStats,
        loading,
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
