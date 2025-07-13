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
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp 
} from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import type { IBus } from "../types/counter.types"
import type { IActiveBooking } from "../context/counter-context"

export function BookTicketPage() {
  const { operator, refreshActiveBookings } = useCounter()
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
  const [availableBuses, setAvailableBuses] = useState<IBus[]>([])
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookedTicket, setBookedTicket] = useState<IActiveBooking | null>(null)

  const bookingService = new BookingService()

  // Search buses from Firestore filtered by operator
  const handleSearchBuses = async () => {
    if (!formData.from || !formData.to) {
      alert("Please select both departure and destination cities")
      return
    }

    if (!operator) {
      alert("Operator not authenticated")
      return
    }

    setIsLoading(true)
    try {
      // Query Firestore for buses matching the criteria
      const q = query(
        collection(firestore, "buses"),
        where("operatorId", "==", operator.uid),
        where("startPoint", "==", formData.from),
        where("endPoint", "==", formData.to),
        where("status", "==", "Active")
      )
      
      const snapshot = await getDocs(q)
      const buses: IBus[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      } as IBus))
      
      setAvailableBuses(buses)
      
      if (buses.length === 0) {
        alert("No buses found for this route")
      }
    } catch (error) {
      console.error("Error searching buses:", error)
      alert("Error searching buses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBusSelect = (busId: string) => {
    const bus = availableBuses.find((b) => b.id === busId)
    setSelectedBus(bus || null)
    setFormData({ ...formData, busId })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedBus || !operator) {
      alert("Please select a bus")
      return
    }

    if (!formData.passengerName || !formData.passengerPhone) {
      alert("Please fill in passenger details")
      return
    }

    if (!formData.seatNumber) {
      alert("Please enter seat number")
      return
    }

    const seatNum = parseInt(formData.seatNumber)
    if (isNaN(seatNum) || seatNum <= 0) {
      alert("Please enter a valid seat number")
      return
    }

    // Removed validation for boarding and dropping points since they're now optional

    setIsLoading(true)
    try {
      // Create booking in activeBookings collection
      const bookingData: Omit<IActiveBooking, "id"> = {
        operatorId: operator.uid,
        userId: operator.uid, // Using operator as user for now
        busId: selectedBus.id,
        busName: selectedBus.name,
        from: formData.from,
        to: formData.to,
        date: formData.date,
        time: selectedBus.departureTime,
        seatNumber: seatNum,
        passengerName: formData.passengerName,
        passengerPhone: formData.passengerPhone,
        boardingPoint: formData.boardingPoint || "", // Default to empty string if not provided
        droppingPoint: formData.droppingPoint || "", // Default to empty string if not provided
        amount: selectedBus.price,
        bookingTime: serverTimestamp(),
        status: "booked"
      }

      // Add to Firestore
      const docRef = await addDoc(collection(firestore, "activeBookings"), bookingData)
      
      // Create the booked ticket object with the new ID
      const newBooking: IActiveBooking = {
        id: docRef.id,
        ...bookingData,
        bookingTime: new Date() // For display purposes
      }

      // Also create in the old bookings system for backward compatibility
      await bookingService.createBooking({
        busId: selectedBus.id,
        operatorId: operator.uid,
        passengerName: formData.passengerName,
        passengerPhone: formData.passengerPhone,
        from: formData.from,
        to: formData.to,
        date: formData.date,
        time: selectedBus.departureTime,
        seatNumber: seatNum.toString(),
        amount: selectedBus.price,
        status: "Confirmed",
        boardingPoint: formData.boardingPoint || "",
        droppingPoint: formData.droppingPoint || "",
        busName: selectedBus.name,
        busType: selectedBus.type,
      })

      setBookedTicket(newBooking)
      setBookingSuccess(true)
      
      // Refresh active bookings to show new booking
      await refreshActiveBookings()
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
                {bookedTicket.boardingPoint && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Boarding Point</Label>
                    <p className="text-lg">{bookedTicket.boardingPoint}</p>
                  </div>
                )}
                {bookedTicket.droppingPoint && (
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Dropping Point</Label>
                    <p className="text-lg">{bookedTicket.droppingPoint}</p>
                  </div>
                )}
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

            {availableBuses.length === 0 && formData.from && formData.to && !isLoading && (
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

                {/* Seat Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="seatNumber">Seat Number *</Label>
                  <Input
                    id="seatNumber"
                    type="number"
                    value={formData.seatNumber}
                    onChange={(e) => setFormData({ ...formData, seatNumber: e.target.value })}
                    placeholder="Enter seat number (e.g., 12)"
                    min="1"
                    max="50"
                    required
                  />
                </div>

                {/* Boarding & Dropping Points - Now Optional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Boarding Point (Optional)</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, boardingPoint: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select boarding point (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBus.boardingPoints?.map((point: string) => (
                          <SelectItem key={point} value={point}>
                            {point}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Dropping Point (Optional)</Label>
                    <Select onValueChange={(value) => setFormData({ ...formData, droppingPoint: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dropping point (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedBus.droppingPoints?.map((point: string) => (
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