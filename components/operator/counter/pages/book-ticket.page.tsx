"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import CitySelect from "@/components/city-select"
import DatePicker from "@/components/date-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TicketIcon, CheckCircleIcon } from "lucide-react"
import { useCounter } from "../context/counter-context"
import { BookingService } from "../services/booking.service"
import { BusService } from "../services/bus.service"

export function BookTicketPage() {
  const { operator, refreshData } = useCounter()
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    date: new Date().toISOString().split("T")[0],
    passengerName: "",
    passengerPhone: "",
    boardingPoint: "",
    droppingPoint: "",
    busId: "",
    seatNumber: "",
  })
  const [availableBuses, setAvailableBuses] = useState<any[]>([])
  const [selectedBus, setSelectedBus] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookedTicket, setBookedTicket] = useState<any>(null)

  const bookingService = new BookingService()
  const busService = new BusService()

  const handleSearchBuses = async () => {
    if (!formData.from || !formData.to) {
      alert("Please select both departure and destination cities")
      return
    }

    setIsLoading(true)
    try {
      const buses = await busService.searchBuses(formData.from, formData.to, formData.date)
      // Filter buses for current operator
      const operatorBuses = buses.filter((bus) => bus.operatorId === operator?.id)
      setAvailableBuses(operatorBuses)
    } catch (error) {
      console.error("Error searching buses:", error)
      alert("Error searching buses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusSelect = (busId: string) => {
    const bus = availableBuses.find((b) => b.id === busId)
    setSelectedBus(bus)
    setFormData({ ...formData, busId })
  }

  const generateSeatNumber = () => {
    // Generate random seat number
    const rows = ["A", "B", "C", "D", "E"]
    const numbers = Array.from({ length: 20 }, (_, i) => i + 1)
    const randomRow = rows[Math.floor(Math.random() * rows.length)]
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)]
    return `${randomRow}${randomNumber}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBus) {
      alert("Please select a bus")
      return
    }

    if (!formData.passengerName || !formData.passengerPhone) {
      alert("Please fill in passenger details")
      return
    }

    setIsLoading(true)
    try {
      const seatNumber = generateSeatNumber()
      const booking = await bookingService.createBooking({
        busId: selectedBus.id,
        operatorId: operator!.id,
        passengerName: formData.passengerName,
        passengerPhone: formData.passengerPhone,
        from: formData.from,
        to: formData.to,
        date: formData.date,
        time: selectedBus.departureTime,
        seatNumber,
        amount: selectedBus.price,
        status: "Confirmed",
        boardingPoint: formData.boardingPoint,
        droppingPoint: formData.droppingPoint,
        busName: selectedBus.name,
        busType: selectedBus.type,
      })

      setBookedTicket(booking)
      setBookingSuccess(true)
      await refreshData() // Refresh data to show new booking in transactions
    } catch (error) {
      console.error("Error booking ticket:", error)
      alert("Error booking ticket")
    } finally {
      setIsLoading(false)
    }
  }

  const handleNewBooking = () => {
    setBookingSuccess(false)
    setBookedTicket(null)
    setFormData({
      from: "",
      to: "",
      date: new Date().toISOString().split("T")[0],
      passengerName: "",
      passengerPhone: "",
      boardingPoint: "",
      droppingPoint: "",
      busId: "",
      seatNumber: "",
    })
    setAvailableBuses([])
    setSelectedBus(null)
  }

  if (bookingSuccess && bookedTicket) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-green-800 mb-2">Ticket Booked Successfully!</h1>
            <p className="text-green-700 mb-6">Booking confirmation details below</p>

            <div className="bg-white rounded-lg p-6 text-left space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Booking ID</Label>
                  <p className="font-mono text-lg">{bookedTicket.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Passenger</Label>
                  <p className="text-lg">{bookedTicket.passengerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Route</Label>
                  <p className="text-lg">
                    {bookedTicket.from} → {bookedTicket.to}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Date & Time</Label>
                  <p className="text-lg">
                    {bookedTicket.date} at {bookedTicket.time}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Bus</Label>
                  <p className="text-lg">{bookedTicket.busName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Seat</Label>
                  <p className="text-lg font-bold text-red-600">{bookedTicket.seatNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Amount</Label>
                  <p className="text-xl font-bold text-green-600">Rs. {bookedTicket.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">Status</Label>
                  <p className="text-lg text-green-600 font-semibold">{bookedTicket.status}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mt-6">
              <Button onClick={handleNewBooking} className="bg-red-600 hover:bg-red-700">
                Book Another Ticket
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                Print Ticket
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <TicketIcon className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Book Ticket</h1>
        </div>
        <p className="text-gray-600">Book tickets for passengers at the counter</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Passenger Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label>From</Label>
                <div className="border rounded-md">
                  <CitySelect
                    value={formData.from}
                    onChange={(value) => setFormData({ ...formData, from: value })}
                    placeholder="Select departure city"
                    label=""
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <div className="border rounded-md">
                  <CitySelect
                    value={formData.to}
                    onChange={(value) => setFormData({ ...formData, to: value })}
                    placeholder="Select destination city"
                    label=""
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <div className="border rounded-md">
                  <DatePicker value={formData.date} onChange={(value) => setFormData({ ...formData, date: value })} />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button type="button" onClick={handleSearchBuses} disabled={isLoading} variant="outline">
                {isLoading ? "Searching..." : "Search Available Buses"}
              </Button>
            </div>

            {/* Available Buses */}
            {availableBuses.length > 0 && (
              <div className="space-y-4">
                <Label className="text-lg font-semibold">Available Buses</Label>
                <div className="grid gap-4">
                  {availableBuses.map((bus) => (
                    <Card
                      key={bus.id}
                      className={`cursor-pointer transition-all ${
                        selectedBus?.id === bus.id ? "ring-2 ring-red-600 bg-red-50" : "hover:shadow-md"
                      }`}
                      onClick={() => handleBusSelect(bus.id)}
                    >
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                          <div>
                            <h3 className="font-semibold">{bus.name}</h3>
                            <p className="text-sm text-gray-600">{bus.type}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Departure</p>
                            <p className="font-semibold">{bus.departureTime}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Duration</p>
                            <p className="font-semibold">{bus.duration}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Price</p>
                            <p className="text-xl font-bold text-red-600">Rs. {bus.price.toLocaleString()}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {availableBuses.length === 0 && formData.from && formData.to && (
              <div className="text-center py-8">
                <p className="text-gray-600">No buses available for this route. Please try a different route.</p>
              </div>
            )}

            {/* Passenger Information */}
            {selectedBus && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="passengerName">Passenger Name *</Label>
                    <Input
                      id="passengerName"
                      value={formData.passengerName}
                      onChange={(e) => setFormData({ ...formData, passengerName: e.target.value })}
                      placeholder="Enter passenger name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passengerPhone">Phone Number *</Label>
                    <Input
                      id="passengerPhone"
                      value={formData.passengerPhone}
                      onChange={(e) => setFormData({ ...formData, passengerPhone: e.target.value })}
                      placeholder="+977 98XXXXXXXX"
                      required
                    />
                  </div>
                </div>

                {/* Boarding & Dropping Points */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Boarding Point</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, boardingPoint: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select boarding point" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBus.boardingPoints.map((point: string) => (
                          <SelectItem key={point} value={point}>
                            {point}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dropping Point</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, droppingPoint: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dropping point" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBus.droppingPoints.map((point: string) => (
                          <SelectItem key={point} value={point}>
                            {point}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button type="button" variant="outline" onClick={handleNewBooking}>
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-red-600 hover:bg-red-700">
                    {isLoading ? "Booking..." : "Book Ticket"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
