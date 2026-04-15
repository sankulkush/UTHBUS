"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { IBus } from "@/components/operator/counter/types/counter.types"

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PassengerDetails {
  name: string
  phone: string
  boardingPoint: string
  droppingPoint: string
}

export interface BookingState {
  bus: IBus | null
  seats: string[]
  from: string
  to: string
  date: string
  passenger: PassengerDetails
}

interface BookingContextType {
  booking: BookingState
  setSearchInfo: (from: string, to: string, date: string) => void
  selectBusAndSeats: (bus: IBus, seats: string[]) => void
  setPassengerDetails: (details: PassengerDetails) => void
  clearBooking: () => void
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const defaultPassenger: PassengerDetails = {
  name: "", phone: "", boardingPoint: "", droppingPoint: "",
}

const defaultBooking: BookingState = {
  bus: null, seats: [], from: "", to: "", date: "",
  passenger: defaultPassenger,
}

// ── Context ───────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(defaultBooking)

  const setSearchInfo = useCallback((from: string, to: string, date: string) =>
    setBooking((p) => ({ ...p, from, to, date })), [])

  const selectBusAndSeats = useCallback((bus: IBus, seats: string[]) =>
    setBooking((p) => ({ ...p, bus, seats })), [])

  const setPassengerDetails = useCallback((details: PassengerDetails) =>
    setBooking((p) => ({ ...p, passenger: details })), [])

  const clearBooking = useCallback(() => setBooking(defaultBooking), [])

  return (
    <BookingContext.Provider value={{ booking, setSearchInfo, selectBusAndSeats, setPassengerDetails, clearBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBooking must be used within BookingProvider")
  return ctx
}
