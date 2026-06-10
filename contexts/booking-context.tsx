"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
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
  hydrated: boolean
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

// Survives the guest-login round-trip and accidental tab refreshes during checkout.
// Cleared by clearBooking() after the ticket is issued.
const STORAGE_KEY = "uthbus:booking-draft"

// ── Context ───────────────────────────────────────────────────────────────────

const BookingContext = createContext<BookingContextType | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingState>(defaultBooking)
  const [hydrated, setHydrated] = useState(false)

  // Hydrate from sessionStorage on mount (client-only, avoids SSR mismatch).
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as BookingState
        if (parsed && typeof parsed === "object") setBooking(parsed)
      }
    } catch {}
    setHydrated(true)
  }, [])

  // Persist on every change, after first hydration.
  useEffect(() => {
    if (!hydrated) return
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking))
    } catch {}
  }, [booking, hydrated])

  const setSearchInfo = useCallback((from: string, to: string, date: string) =>
    setBooking((p) => ({ ...p, from, to, date })), [])

  const selectBusAndSeats = useCallback((bus: IBus, seats: string[]) =>
    setBooking((p) => ({ ...p, bus, seats })), [])

  const setPassengerDetails = useCallback((details: PassengerDetails) =>
    setBooking((p) => ({ ...p, passenger: details })), [])

  const clearBooking = useCallback(() => {
    setBooking(defaultBooking)
    try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
  }, [])

  return (
    <BookingContext.Provider value={{ booking, hydrated, setSearchInfo, selectBusAndSeats, setPassengerDetails, clearBooking }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBooking must be used within BookingProvider")
  return ctx
}
