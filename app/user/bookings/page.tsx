"use client"
import { useState, useEffect } from "react"
import { useUserAuth } from "@/contexts/user-auth-context"
import { ActiveBookingsService, type IActiveBooking } from "@/components/operator/counter/services/active-booking.service"
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
  FilterIcon,
  PrinterIcon,
  DownloadIcon,
  RefreshCwIcon
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BookingTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  counts: {
    upcoming: number
    past: number
    cancelled: number
  }
}

function BookingTabs({ activeTab, onTabChange, counts }: BookingTabsProps) {
  const tabs = [
    { id: 'upcoming', label: 'Upcoming', count: counts.upcoming, color: 'text-blue-600' },
    { id: 'past', label: 'Past', count: counts.past, color: 'text-green-600' },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled, color: 'text-red-600' }
  ]

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 flex items-center justify-center py-2 px-4 rounded-md text-sm font-medium transition-all
            ${activeTab === tab.id 
              ? 'bg-white shadow-sm text-gray-900' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }
          `}
        >
          <span className={tab.color}>{tab.label}</span>
          {tab.count > 0 && (
            <span className={`
              ml-2 px-2 py-0.5 text-xs rounded-full
              ${activeTab === tab.id 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-gray-300 text-gray-600'
              }
            `}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

export default function BookingsPage() {
  const { userProfile } = useUserAuth()
  const [bookings, setBookings] = useState<IActiveBooking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<IActiveBooking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('upcoming')
  const [counts, setCounts] = useState({
    upcoming: 0,
    past: 0,
    cancelled: 0
  })
  
  const activeBookingsService = new ActiveBookingsService()
  
  // Fetch user bookings on component mount
  useEffect(() => {
    if (userProfile) {
      fetchUserBookings()
    }
  }, [userProfile])
  
  // Filter bookings based on active tab
  useEffect(() => {
    let filtered = bookings
    
    // Apply tab filter based on status
    switch (activeTab) {
      case 'upcoming':
        filtered = filtered.filter(booking => booking.status === 'booked')
        break
      case 'past':
        filtered = filtered.filter(booking => booking.status === 'completed')
        break
      case 'cancelled':
        filtered = filtered.filter(booking => booking.status === 'cancelled')
        break
    }
    
    setFilteredBookings(filtered)
  }, [bookings, activeTab])
  
  // Calculate counts for each tab
  useEffect(() => {
    const upcoming = bookings.filter(booking => booking.status === 'booked').length
    const past = bookings.filter(booking => booking.status === 'completed').length
    const cancelled = bookings.filter(booking => booking.status === 'cancelled').length
    
    setCounts({ upcoming, past, cancelled })
  }, [bookings])
  
  const fetchUserBookings = async () => {
    if (!userProfile) return
    setIsLoading(true)
    try {
      const userBookings = await activeBookingsService.getUserBookings(userProfile.uid)
      setBookings(userBookings)
    } catch (error) {
      console.error("Error fetching user bookings:", error)
      alert("Error loading your bookings")
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return
    try {
      // First update the status to cancelled
      await activeBookingsService.updateActiveBooking(bookingId, { status: 'cancelled' })
      // Then call the cancel method for any additional cleanup
      await activeBookingsService.cancelActiveBooking(bookingId)
      // Refresh bookings after cancellation
      await fetchUserBookings()
      alert("Booking cancelled successfully")
    } catch (error) {
      console.error("Error cancelling booking:", error)
      alert("Error cancelling booking")
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
  
  const canCancelBooking = (booking: IActiveBooking) => {
    // Only allow cancellation for booked bookings
    if (booking.status !== "booked") return false
    
    try {
      const travelDate = new Date(booking.date)
      const today = new Date()
      today.setHours(23, 59, 59, 999) // End of today
      
      // Allow cancellation if travel date is today or in the future
      return travelDate >= today
    } catch (e) {
      console.error("Invalid date for booking:", booking.id, booking.date)
      return false
    }
  }
  
  const printTicket = (booking: IActiveBooking) => {
    // Create a printable ticket
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Bus Ticket - ${booking.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .ticket { border: 2px solid #000; padding: 20px; max-width: 400px; }
              .header { text-align: center; border-bottom: 1px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
              .row { display: flex; justify-content: space-between; margin: 8px 0; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="ticket">
              <div class="header">
                <h2>UTHBUS</h2>
                <p>Bus Ticket</p>
              </div>
              <div class="row"><span class="label">Booking ID:</span> <span>${booking.id}</span></div>
              <div class="row"><span class="label">Bus:</span> <span>${booking.busName}</span></div>
              <div class="row"><span class="label">From:</span> <span>${booking.from}</span></div>
              <div class="row"><span class="label">To:</span> <span>${booking.to}</span></div>
              <div class="row"><span class="label">Date:</span> <span>${formatDate(booking.date)}</span></div>
              <div class="row"><span class="label">Time:</span> <span>${booking.time}</span></div>
              <div class="row"><span class="label">Seat:</span> <span>${booking.seatNumber}</span></div>
              <div class="row"><span class="label">Passenger:</span> <span>${booking.passengerName}</span></div>
              <div class="row"><span class="label">Phone:</span> <span>${booking.passengerPhone}</span></div>
              <div class="row"><span class="label">Amount:</span> <span>Rs. ${booking.amount}</span></div>
              <div class="row"><span class="label">Status:</span> <span>${booking.status.toUpperCase()}</span></div>
              ${booking.boardingPoint ? `<div class="row"><span class="label">Boarding:</span> <span>${booking.boardingPoint}</span></div>` : ''}
              ${booking.droppingPoint ? `<div class="row"><span class="label">Dropping:</span> <span>${booking.droppingPoint}</span></div>` : ''}
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <TicketIcon className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        </div>
        <p className="text-gray-600">View and manage your bus bookings</p>
      </div>
      
      {/* Tabs */}
      <BookingTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
      />
      
      {/* Results Summary */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredBookings.length} of {bookings.length} bookings
        </p>
        <Button 
          onClick={fetchUserBookings} 
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700"
        >
          <RefreshCwIcon className="w-4 h-4 mr-2" />
          {isLoading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      
      {/* Bookings List */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <RefreshCwIcon className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your bookings...</p>
          </CardContent>
        </Card>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <TicketIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookings Found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'upcoming' ? "You don't have any upcoming bookings." : 
               activeTab === 'past' ? "You don't have any past bookings." : 
               "You don't have any cancelled bookings."}
            </p>
            {bookings.length === 0 && (
              <Button 
                onClick={() => window.location.href = '/'} 
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Search Buses
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-red-100 p-3 rounded-lg">
                      <BusIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{booking.busName}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {booking.from} → {booking.to}
                      </p>
                      <p className="text-xs text-gray-500">
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
                  <div className="flex items-center space-x-2">
                    <UserIcon className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Seat {booking.seatNumber}</p>
                      <p className="text-xs text-gray-500">Your Seat</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CreditCardIcon className="w-4 h-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Rs. {booking.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Amount Paid</p>
                    </div>
                  </div>
                </div>
                {(booking.boardingPoint || booking.droppingPoint) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {booking.boardingPoint && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium">{booking.boardingPoint}</p>
                          <p className="text-xs text-gray-500">Boarding Point</p>
                        </div>
                      </div>
                    )}
                    {booking.droppingPoint && (
                      <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-4 h-4 text-red-600" />
                        <div>
                          <p className="text-sm font-medium">{booking.droppingPoint}</p>
                          <p className="text-xs text-gray-500">Dropping Point</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => printTicket(booking)}
                  >
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Print Ticket
                  </Button>
                  
                  {/* Show Cancel button for any booked booking */}
                  {booking.status === "booked" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleCancelBooking(booking.id!)}
                    >
                      Cancel Booking
                    </Button>
                  )}
                  
                  {booking.status === "booked" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => alert("Contact support for booking modifications")}
                    >
                      Need Help?
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}