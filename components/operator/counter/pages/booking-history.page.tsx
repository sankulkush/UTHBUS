"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HistoryIcon, SearchIcon, DownloadIcon } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock completed bookings data
const mockCompletedBookings = [
  {
    id: "booking3",
    busId: "bus1",
    operatorId: "op1",
    passengerName: "Hari Bahadur",
    passengerPhone: "+977 9843333333",
    from: "Kathmandu",
    to: "Pokhara",
    date: "2024-12-25",
    time: "07:00",
    seatNumber: "B5",
    amount: 1200,
    status: "Completed" as const,
    bookingDate: "2024-12-24",
    boardingPoint: "New Bus Park",
    droppingPoint: "Pokhara Bus Park",
  },
  {
    id: "booking4",
    busId: "bus2",
    operatorId: "op1",
    passengerName: "Maya Gurung",
    passengerPhone: "+977 9844444444",
    from: "Kathmandu",
    to: "Chitwan",
    date: "2024-12-26",
    time: "09:00",
    seatNumber: "C3",
    amount: 800,
    status: "Completed" as const,
    bookingDate: "2024-12-25",
    boardingPoint: "Kalanki",
    droppingPoint: "Bharatpur Bus Park",
  },
  {
    id: "booking5",
    busId: "bus1",
    operatorId: "op1",
    passengerName: "Bikash Shrestha",
    passengerPhone: "+977 9845555555",
    from: "Pokhara",
    to: "Kathmandu",
    date: "2024-12-27",
    time: "14:00",
    seatNumber: "A8",
    amount: 1200,
    status: "Completed" as const,
    bookingDate: "2024-12-26",
    boardingPoint: "Lakeside",
    droppingPoint: "New Bus Park",
  },
]

export function BookingHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [dateFilter, setDateFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredBookings = mockCompletedBookings.filter((booking) => {
    const matchesSearch =
      booking.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.passengerPhone.includes(searchQuery) ||
      booking.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.to.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = dateFilter === "all" || booking.date.includes(dateFilter)
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesDate && matchesStatus
  })

  const handleExportCSV = () => {
    // Mock CSV export functionality
    alert("Exporting booking history to CSV...")
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <HistoryIcon className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
        </div>
        <p className="text-gray-600">View all completed trips and past bookings</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search bookings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="2024-12">December 2024</SelectItem>
                <SelectItem value="2024-11">November 2024</SelectItem>
                <SelectItem value="2024-10">October 2024</SelectItem>
              </SelectContent>
            </Select>

            <Select onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleExportCSV} variant="outline" className="bg-transparent">
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Trips ({filteredBookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Booking ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Passenger</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Route</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Travel Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Booking Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <p className="font-mono text-sm text-gray-600">{booking.id}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.passengerName}</p>
                        <p className="text-sm text-gray-600">{booking.passengerPhone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {booking.from} → {booking.to}
                        </p>
                        <p className="text-sm text-gray-600">Seat: {booking.seatNumber}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900">{booking.date}</p>
                        <p className="text-sm text-gray-600">{booking.time}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-600">{booking.bookingDate}</p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900">Rs. {booking.amount.toLocaleString()}</p>
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant="default" className="bg-green-600">
                        {booking.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBookings.length === 0 && (
              <div className="text-center py-12">
                <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No booking history found</h3>
                <p className="text-gray-600">
                  {searchQuery || dateFilter !== "all" || statusFilter !== "all"
                    ? "Try adjusting your search criteria"
                    : "No completed bookings yet"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
