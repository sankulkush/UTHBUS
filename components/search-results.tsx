"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { BusIcon, AirVentIcon, TvIcon, WifiIcon, ArrowLeftRightIcon } from "lucide-react"

const mockBuses = [
  {
    id: 1,
    name: "Sapana Yatayat",
    route: "Ashok Leyland AC/Sofa Seater",
    departureTime: "14:30",
    arrivalTime: "6:30",
    duration: "14h 0m",
    price: 1500,
    rating: 4.1,
    amenities: ["Sofa seat", "Air Condition", "TV"],
    departureDate: "21 Nov",
    arrivalDate: "22 Nov",
    busType: "AC"
  },
  {
    id: 2,
    name: "Sundar Birat Yatra",
    route: "Ashok Leyland AC/Sofa Seater",
    departureTime: "14:30",
    arrivalTime: "6:30",
    duration: "14h 0m",
    price: 1500,
    rating: 4.1,
    amenities: ["Sofa seat", "Air Condition", "TV"],
    departureDate: "21 Nov",
    arrivalDate: "22 Nov",
    busType: "AC"
  },
  {
    id: 3,
    name: "Apsara Yatayat",
    route: "Ashok Leyland AC/Sofa Seater",
    departureTime: "14:30",
    arrivalTime: "6:30",
    duration: "14h 0m",
    price: 1500,
    rating: 4.1,
    amenities: ["Sofa seat", "Air Condition", "TV"],
    departureDate: "21 Nov",
    arrivalDate: "22 Nov",
    busType: "Deluxe"
  },
  {
    id: 4,
    name: "Green Line",
    route: "Volvo AC/Sleeper",
    departureTime: "20:00",
    arrivalTime: "8:00",
    duration: "12h 0m",
    price: 2000,
    rating: 4.3,
    amenities: ["Sleeper", "Air Condition", "WiFi", "TV"],
    departureDate: "21 Nov",
    arrivalDate: "22 Nov",
    busType: "Hiace"
  },
]

export default function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
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
  const date = searchParams.get("date") || "2024-11-20"

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
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
              <h2 className="text-2xl font-bold text-gray-800">{mockBuses.length} buses found</h2>
            </div>

            <div className="space-y-6">
              {mockBuses.map((bus) => (
                <Card key={bus.id} className="hover:shadow-xl transition-all duration-300 border-0 rounded-2xl overflow-hidden">
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Bus Info */}
                      <div className="lg:col-span-4 space-y-4">
                        <div>
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">{bus.name}</h3>
                          <p className="text-gray-600 text-base mb-4">{bus.route}</p>
                        </div>

                        <div className="flex items-center space-x-4">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                            ⭐ {bus.rating}
                          </Badge>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            {bus.amenities.map((amenity, index) => (
                              <div key={index} className="flex items-center space-x-1">
                                {amenity === "Air Condition" && <AirVentIcon className="w-4 h-4" />}
                                {amenity === "TV" && <TvIcon className="w-4 h-4" />}
                                {amenity === "WiFi" && <WifiIcon className="w-4 h-4" />}
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
                            <div className="text-sm text-gray-600 mt-1">{bus.departureDate}</div>
                          </div>

                          <div className="flex-1 mx-8">
                            <div className="text-center text-sm text-gray-600 mb-2 font-medium">{bus.duration}</div>
                            <div className="border-t-2 border-gray-300 relative">
                              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-gray-300 rounded-full border-2 border-white"></div>
                            </div>
                          </div>

                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-800">{bus.arrivalTime}</div>
                            <div className="text-sm text-gray-600 mt-1">{bus.arrivalDate}</div>
                          </div>
                        </div>
                      </div>

                      {/* Price and Book */}
                      <div className="lg:col-span-4 text-right">
                        <div className="text-3xl font-bold text-gray-800 mb-4">Rs. {bus.price.toLocaleString()}</div>
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-200">
                          BOOK NOW
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