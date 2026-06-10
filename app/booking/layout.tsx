"use client"

import UserAuthGuard from "@/components/auth/UserAuthGuard"

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  // Anonymous user → login modal appears; dismissing it routes them home
  // so they aren't stranded on a blank page. Seat selection sits in
  // sessionStorage (booking-context) so it survives the round-trip.
  return <UserAuthGuard redirectOnDismiss="/">{children}</UserAuthGuard>
}
