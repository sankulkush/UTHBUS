"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  TicketIcon, 
  CalendarIcon, 
  ClockIcon, 
  UserIcon, 
  PhoneIcon,
  MapPinIcon,
  BusIcon,
  CreditCardIcon,
  SearchIcon,
  FilterIcon
} from "lucide-react"
import { useCounter } from "../context/counter-context"
import { ActiveBookingsService, type IActiveBooking } from "../services/active-booking.service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function BookedTransactionsPage() {
  const { operator } = useCounter()
  const [activeBookings, setActiveBookings] = useState<IActiveBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<IActiveBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState("")

  const activeBookingsService = new ActiveBookingsService()

  // Fetch active bookings on component mount
  useEffect(() => {
    if (operator) {
      fetchActiveBookings()
    }
  }, [operator])

  // Filter bookings based on search and filters
  useEffect(() => {
    let filtered = activeBookings

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(booking => 
        booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.passengerPhone.includes(searchTerm) ||
        booking.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.to.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter(booking => booking.status === filterStatus)
    }

    // Date filter
    if (filterDate) {
      filtered = filtered.filter(booking => booking.date === filterDate)
    }

    setFilteredBookings(filtered)
  }, [activeBookings, searchTerm, filterStatus, filterDate])

  const fetchActiveBookings = async () => {
    if (!operator) return

    setIsLoading(true)
    try {
      const bookings = await activeBookingsService.getActiveBookings(operator.uid)
      setActiveBookings(bookings)
    } catch (error) {
      console.error("Error fetching active bookings:", error)
      alert("Error loading bookings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return

    try {
      await activeBookingsService.cancelActiveBooking(bookingId)
      // Refresh bookings after cancellation
      await fetchActiveBookings()
      alert("Booking cancelled successfully")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      alert("Error cancelling booking")
    }
  }

  const handleUpdateBookingStatus = async (bookingId: string, newStatus: "booked" | "cancelled" | "completed") => {
    try {
      await activeBookingsService.updateActiveBooking(bookingId, { status: newStatus })
      // Refresh bookings after update
      await fetchActiveBookings()
      alert(`Booking status updated to ${newStatus}`)
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("Error updating booking status")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "booked":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatBookingTime = (timestamp: any) => {
    if (!timestamp) return "N/A"
    
    // Handle Firestore timestamp
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!operator) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Please log in to view booked transactions</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <TicketIcon className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Booked Transactions</h1>
        </div>
        <p className="text-gray-600">View and manage all passenger bookings</p>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FilterIcon className="w-5 h-5" />
            <span>Search & Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, phone, bus..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={fetchActiveBookings} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {activeBookings.length} bookings
        </p>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-green-50">
            Booked: {activeBookings.filter(b => b.status === "booked").length}
          </Badge>
          <Badge variant="outline" className="bg-blue-50">
            Completed: {activeBookings.filter(b => b.status === "completed").length}
          </Badge>
          <Badge variant="outline" className="bg-red-50">
            Cancelled: {activeBookings.filter(b => b.status === "cancelled").length}
          </Badge>
        </div>
      </div>

      {/* Bookings List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Loading bookings...</p>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600">
              {activeBookings.length === 0 
                ? "No bookings have been made yet." 
                : "No bookings match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <BusIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{booking.busName}</h3>
                      <p className="text-sm text-gray-600">
                        {booking.from} → {booking.to}
                      </p>
                      <p className="text-sm text-gray-500">
                        Booking ID: {booking.id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <p className="text-sm text-gray-500 mt-1">
                      Booked: {formatBookingTime(booking.bookingTime)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{booking.passengerName}</p>
                      <p className="text-xs text-gray-500">Passenger</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <PhoneIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{booking.passengerPhone}</p>
                      <p className="text-xs text-gray-500">Phone</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                      <p className="text-xs text-gray-500">Travel Date</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{booking.time}</p>
                      <p className="text-xs text-gray-500">Departure</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">{booking.boardingPoint}</p>
                      <p className="text-xs text-gray-500">Boarding Point</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">{booking.droppingPoint}</p>
                      <p className="text-xs text-gray-500">Dropping Point</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Seat {booking.seatNumber}</p>
                      <p className="text-xs text-gray-500">Rs. {booking.amount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  {booking.status === "booked" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateBookingStatus(booking.id!, "completed")}
                      >
                        Mark Completed
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleCancelBooking(booking.id!)}
                      >
                        Cancel Booking
                      </Button>
                    </>
                  )}
                  {booking.status === "cancelled" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateBookingStatus(booking.id!, "booked")}
                    >
                      Reactivate
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.print()}
                  >
                    Print Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}