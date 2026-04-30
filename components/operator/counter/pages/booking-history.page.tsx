"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HistoryIcon, SearchIcon, RefreshCwIcon } from "lucide-react"
import { useCounter } from "../context/counter-context"
import { ActiveBookingsService, type IActiveBooking } from "../services/active-booking.service"

export function BookingHistoryPage() {
  const { operator } = useCounter()
  const [bookings, setBookings] = useState<IActiveBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDate, setFilterDate] = useState("")

  const service = new ActiveBookingsService()

  useEffect(() => {
    if (operator) fetchHistory()
  }, [operator])

  const fetchHistory = async () => {
    if (!operator) return
    setIsLoading(true)
    try {
      const raw = await service.getOperatorBookings(operator.uid)
      // Auto-complete any newly-elapsed bookings, then filter for completed
      const updated = await service.autoCompletePastBookings(raw)
      setBookings(updated.filter(b => b.status === "completed"))
    } catch (err) {
      console.error("Error fetching booking history:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (ds: string) => {
    const [y, m, d] = ds.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString("en-US", {
      weekday: "short", year: "numeric", month: "short", day: "numeric",
    })
  }

  const formatBookingTime = (ts: any) => {
    if (!ts) return "N/A"
    const d = ts.toDate ? ts.toDate() : new Date(ts)
    return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
  }

  const filtered = bookings.filter(b => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      b.passengerName.toLowerCase().includes(q) ||
      b.passengerPhone.includes(q) ||
      b.busName.toLowerCase().includes(q) ||
      b.from.toLowerCase().includes(q) ||
      b.to.toLowerCase().includes(q) ||
      (b.id || "").toLowerCase().includes(q)
    const matchesDate = !filterDate || b.date === filterDate
    return matchesSearch && matchesDate
  })

  if (!operator) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Please log in to view booking history</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <HistoryIcon className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
        </div>
        <p className="text-gray-600">All completed trips for your buses</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Name, phone, bus, ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              placeholder="Filter by travel date"
            />
            <Button onClick={fetchHistory} disabled={isLoading} className="bg-red-600 hover:bg-red-700">
              <RefreshCwIcon className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              {isLoading ? "Loading…" : "Refresh"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Trips ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-8 text-center">
              <RefreshCwIcon className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading history…</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Booking ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Passenger</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Route</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Travel Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Booked At</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => (
                    <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <p className="font-mono text-xs text-gray-600">{(b.id || "").slice(0, 8).toUpperCase()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 text-sm">{b.passengerName}</p>
                        <p className="text-xs text-gray-500">{b.passengerPhone}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 text-sm">{b.from} → {b.to}</p>
                        <p className="text-xs text-gray-500">
                          {b.seatNumbers?.length ? b.seatNumbers.join(", ") : b.seatNumber || "N/A"}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 text-sm">{formatDate(b.date)}</p>
                        <p className="text-xs text-gray-500">{b.time}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-gray-600">{formatBookingTime(b.bookingTime)}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="font-semibold text-gray-900 text-sm">Rs. {b.amount.toLocaleString()}</p>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Completed</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No completed trips found</h3>
                  <p className="text-gray-600 text-sm">
                    {searchQuery || filterDate
                      ? "Try adjusting your search criteria"
                      : "Trips appear here once their departure time has passed"}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
