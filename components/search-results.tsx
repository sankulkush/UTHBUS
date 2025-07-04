"use client"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BusIcon, AirVentIcon, TvIcon, WifiIcon, ArrowLeftRightIcon, Loader2 } from "lucide-react"

// Define the interface for bus data
interface IBus {
  id: string
  operatorId: string
  busNumber: string
  operatorName: string
  route: string
  departureTime: string
  arrivalTime: string
  duration: string
  price: number
  rating?: number
  amenities: string[]
  departureDate: string
  arrivalDate: string
  busType: string
  totalSeats: number
  availableSeats: number
  from: string
  to: string
  status: 'active' | 'inactive'
}

// API service to fetch buses
const fetchAvailableBuses = async (from: string, to: string, date: string): Promise<IBus[]> => {
  try {
    const response = await fetch(`/api/buses/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`)
    if (!response.ok) {
      throw new Error('Failed to fetch buses')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching buses:', error)
    return []
  }
}

export default function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [buses, setBuses] = useState<IBus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedFilters, setSelectedFilters] = useState({
    ac: false,
    nonAc: false,
    deluxe: false,
    hiace: false,
    sleeper: false,
    seater: false,
  })

  const from = searchParams.get("from") || "Kathmandu"
  const to = searchParams.get("to") || "Biratnagar"
  const date = searchParams.get("date") || new Date().toISOString().split('T')[0]

  // Fetch buses on component mount
  useEffect(() => {
    const loadBuses = async () => {
      setLoading(true)
      setError(null)
      try {
        const busData = await fetchAvailableBuses(from, to, date)
        setBuses(busData)
      } catch (err) {
        setError('Failed to load buses. Please try again.')
        console.error('Error loading buses:', err)
      } finally {
        setLoading(false)
      }
    }

    loadBuses()
  }, [from, to, date])

  // Filter buses based on selected filters
  const filteredBuses = buses.filter(bus => {
    if (!selectedFilters.ac && !selectedFilters.nonAc && !selectedFilters.deluxe && !selectedFilters.hiace && !selectedFilters.sleeper && !selectedFilters.seater) {
      return true // No filters selected, show all
    }

    let matchesFilter = false

    if (selectedFilters.ac && bus.busType.toLowerCase().includes('ac')) matchesFilter = true
    if (selectedFilters.nonAc && !bus.busType.toLowerCase().includes('ac')) matchesFilter = true
    if (selectedFilters.deluxe && bus.busType.toLowerCase().includes('deluxe')) matchesFilter = true
    if (selectedFilters.hiace && bus.busType.toLowerCase().includes('hiace')) matchesFilter = true
    if (selectedFilters.sleeper && bus.amenities.some(amenity => amenity.toLowerCase().includes('sleeper'))) matchesFilter = true
    if (selectedFilters.seater && bus.amenities.some(amenity => amenity.toLowerCase().includes('seater'))) matchesFilter = true

    return matchesFilter
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const handleNewSearch = () => {
    router.push("/")
  }

  const handleFilterChange = (filterType: keyof typeof selectedFilters) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }))
  }

  const clearAllFilters = () => {
    setSelectedFilters({
      ac: false,
      nonAc: false,
      deluxe: false,
      hiace: false,
      sleeper: false,
      seater: false,
    })
  }

  const handleBookNow = (busId: string) => {
    router.push(`/booking/${busId}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                <span className="text-blue-600">uth</span>
                <span className="text-red-600">bus</span>
                <span className="text-xs text-gray-500 ml-1 bg-gray-100 px-2 py-1 rounded">BETA</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-red-800 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3 bg-white text-gray-800 px-6 py-3 rounded-xl shadow-sm">
                <BusIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-lg">{from}</span>
              </div>

              <ArrowLeftRightIcon className="w-6 h-6 text-white" />

              <div className="flex items-center space-x-3 bg-white text-gray-800 px-6 py-3 rounded-xl shadow-sm">
                <BusIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-lg">{to}</span>
              </div>

              <div className="flex items-center space-x-3 bg-white text-gray-800 px-6 py-3 rounded-xl shadow-sm">
                <span className="font-medium text-lg">{formatDate(date)}</span>
              </div>
            </div>

            <Button onClick={handleNewSearch} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold text-lg">
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-sm border-0">
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl text-gray-800">Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 font-semibold"
                    onClick={clearAllFilters}
                  >
                    CLEAR ALL
                  </Button>
                </div>

                <div className="space-y-8">
                  {/* Bus Type Filter */}
                  <div>
                    <h4 className="font-semibold mb-4 text-gray-800 text-lg">Bus Type</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          checked={selectedFilters.ac}
                          onChange={() => handleFilterChange('ac')}
                        />
                        <span className="text-sm text-gray-700">AC</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          checked={selectedFilters.nonAc}
                          onChange={() => handleFilterChange('nonAc')}
                        />
                        <span className="text-sm text-gray-700">Non AC</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          checked={selectedFilters.deluxe}
                          onChange={() => handleFilterChange('deluxe')}
                        />
                        <span className="text-sm text-gray-700">Deluxe</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          checked={selectedFilters.hiace}
                          onChange={() => handleFilterChange('hiace')}
                        />
                        <span className="text-sm text-gray-700">Hiace</span>
                      </label>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Seat Type */}
                  <div>
                    <h4 className="font-semibold mb-4 text-gray-800 text-lg">Seat type</h4>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          checked={selectedFilters.sleeper}
                          onChange={() => handleFilterChange('sleeper')}
                        />
                        <span className="text-sm text-gray-700">Sleeper</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                          checked={selectedFilters.seater}
                          onChange={() => handleFilterChange('seater')}
                        />
                        <span className="text-sm text-gray-700">Seater</span>
                      </label>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Pick up time */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 text-lg">Pick up time - {from}</h4>
                      <Button variant="ghost" size="sm" className="text-blue-600 text-xs font-semibold">
                        CLEAR
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        🌅 6 AM - 11 AM
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        ☀️ 11 AM - 6 PM
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        🌆 6 PM - 11 PM
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        🌙 11 PM - 6 AM
                      </Button>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Drop time */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-800 text-lg">Drop time - {to}</h4>
                      <Button variant="ghost" size="sm" className="text-blue-600 text-xs font-semibold">
                        CLEAR
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        🌅 6 AM - 11 AM
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        ☀️ 11 AM - 6 PM
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        🌆 6 PM - 11 PM
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs py-2 rounded-lg border-gray-300 hover:border-blue-400">
                        🌙 11 PM - 6 AM
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                {loading ? 'Searching...' : `${filteredBuses.length} buses found`}
              </h2>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-3 text-lg text-gray-600">Loading available buses...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-12">
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
                  Try Again
                </Button>
              </div>
            )}

            {!loading && !error && filteredBuses.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No buses found for this route and date.</p>
                <Button onClick={handleNewSearch} className="bg-blue-600 hover:bg-blue-700">
                  Try Different Search
                </Button>
              </div>
            )}

            <div className="space-y-6">
              {filteredBuses.map((bus) => (
                <Card key={bus.id} className="hover:shadow-xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Bus Info */}
                      <div className="lg:col-span-4 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{bus.operatorName}</h3>
                          <p className="text-gray-600 text-base mb-2">{bus.busNumber} - {bus.busType}</p>
                          <p className="text-gray-600 text-sm mb-4">{bus.route}</p>
                          <p className="text-sm text-gray-500">
                            {bus.availableSeats} / {bus.totalSeats} seats available
                          </p>
                        </div>

                        <div className="flex items-center space-x-4">
                          {bus.rating && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                              ⭐ {bus.rating}
                            </Badge>
                          )}
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            {bus.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                {amenity.toLowerCase().includes("air condition") && <AirVentIcon className="w-4 h-4" />}
                                {amenity.toLowerCase().includes("tv") && <TvIcon className="w-4 h-4" />}
                                {amenity.toLowerCase().includes("wifi") && <WifiIcon className="w-4 h-4" />}
                                <span>{amenity}</span>
                                {index < bus.amenities.length - 1 && <span className="text-gray-400 mx-2">•</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Time Info */}
                      <div className="lg:col-span-4 px-6">
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">{bus.departureTime}</div>
                            <div className="text-sm text-gray-600 mt-1">{formatDate(bus.departureDate)}</div>
                          </div>

                          <div className="flex-1 mx-8">
                            <div className="text-center text-sm text-gray-600 mb-2 font-medium">{bus.duration}</div>
                            <div className="border-t-2 border-gray-300 relative">
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">{bus.arrivalTime}</div>
                            <div className="text-sm text-gray-600 mt-1">{formatDate(bus.arrivalDate)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Book */}
                      <div className="lg:col-span-4 text-right">
                        <div className="text-3xl font-bold text-gray-800 mb-4">Rs. {bus.price.toLocaleString()}</div>
                        <Button 
                          onClick={() => handleBookNow(bus.id)}
                          disabled={bus.availableSeats === 0}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {bus.availableSeats === 0 ? 'SOLD OUT' : 'BOOK NOW'}
                        </Button>
                      </div>
                    </div>

                    {/* Additional Options */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex space-x-8 text-sm">
                        <Button variant="ghost" size="sm" className="text-blue-600 p-0 font-semibold hover:text-blue-700">
                          Reviews ▼
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600 p-0 font-semibold hover:text-blue-700">
                          Photos ▼
                        </Button>
                        <Button variant="ghost" size="sm" className="text-blue-600 p-0 font-semibold hover:text-blue-700">
                          Amenities ▼
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}