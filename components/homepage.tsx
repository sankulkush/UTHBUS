"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PhoneIcon, ChevronRightIcon, ChevronLeftIcon, BusIcon } from "lucide-react"
import Image from "next/image"
import CitySelect from "@/components/city-select"
import DatePicker from "@/components/date-picker"
import Link from "next/link"

const popularRoutes = [
  {
    name: "Pokhara",
    image: "Destinations/pokhara.png",
    description: "Beautiful lake city",
  },
  {
    name: "Kathmandu",
    image: "Destinations/kathmandu.jpg",
    description: "Capital city",
  },
  {
    name: "Dharan",
    image: "Destinations/dharan.png",
    description: "Eastern Nepal",
  },
  {
    name: "Biratnagar",
    image: "Destinations/biratnagar.png",
    description: "Industrial city",
  },
]

export default function Homepage() {
  const [from, setFrom] = useState("Kathmandu") // Default to Kathmandu
  const [to, setTo] = useState("Biratnagar") // Default to Biratnagar
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0])
  const [currentSlide, setCurrentSlide] = useState(0)
  const router = useRouter()

  const handleSearch = () => {
    if (!from || !to) {
      alert("Please select both departure and destination cities")
      return
    }

    const searchParams = new URLSearchParams({
      from,
      to,
      date,
    })
    router.push(`/search?${searchParams.toString()}`)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(popularRoutes.length / 4))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(popularRoutes.length / 4)) % Math.ceil(popularRoutes.length / 4))
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold">
                <span className="text-blue-600">uth</span>
                <span className="text-red-600">bus</span>
                <span className="text-xs text-gray-500 ml-1 bg-gray-200 px-1 rounded">BETA</span>
              </span>
            </div>

            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center bg-red-600 text-white px-4 py-2 rounded-lg">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <div className="text-sm">
                  <div className="font-semibold">TICKET ON A CALL</div>
                  <div>+977 9815355501</div>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm">
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>Payment</span>
                  <ChevronRightIcon className="w-3 h-3" />
                </Button>
                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>English</span>
                  <ChevronRightIcon className="w-3 h-3" />
                </Button>

                {/* Add Operator Portal Link */}
                <Link href="/operator/login">
                  <Button variant="ghost" className="flex items-center space-x-1 text-red-600 hover:text-red-700">
                    <BusIcon className="w-4 h-4" />
                    <span>Operator Portal</span>
                  </Button>
                </Link>

                <Button variant="ghost" className="flex items-center space-x-1">
                  <span>Account</span>
                  <ChevronRightIcon className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[450px] overflow-visible">
        <div className="absolute inset-0">
          <Image src="/Hero/bus1.png" alt="Nepal Mountains" fill className="object-cover object-center" priority />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <h1 className="text-4xl md:text-3xl font-bold text-white text-left">Book Bus Tickets</h1>
            </div>

            {/* Search Form */}
            <div className="bg-white rounded-3xl shadow-lg overflow-visible relative z-20">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* From */}
                <div className="md:col-span-3 p-4 border-r border-gray-200">
                  <CitySelect value={from} onChange={setFrom} placeholder="Kathmandu" label="From" />
                </div>

                {/* To */}
                <div className="md:col-span-3 p-4 border-r border-gray-200">
                  <CitySelect value={to} onChange={setTo} placeholder="Biratnagar" label="To" />
                </div>

                {/* Date */}
                <div className="md:col-span-4 p-4 border-r border-gray-200">
                  <DatePicker value={date} onChange={setDate} />
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                  <Button
                    onClick={handleSearch}
                    className="w-full h-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-sm rounded-none rounded-r-3xl border-0 shadow-lg transition-all duration-200"
                  >
                    SEARCH BUSES
                  </Button>
                </div>
              </div>
            </div>

            {/* Nepali tagline below search form */}
            <div className="mt-4">
              <p className="text-3xl text-orange-400 font-semibold text-center">सरल बुकिंग, सफल यात्रा</p>
            </div>
          </div>
        </div>
      </section>

      {/* Available Routes */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-800">AVAILABLE ROUTES</h2>
            <Button
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50 font-medium bg-transparent"
            >
              View All
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularRoutes.map((route, index) => (
                <Card key={index} className="group cursor-pointer hover:shadow-lg transition-shadow border-0 shadow-md">
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={route.image || "/placeholder.svg"}
                        alt={route.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 text-center">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">{route.name}</h3>
                      <p className="text-sm text-gray-600">{route.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Navigation arrows */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="bg-white/90 hover:bg-white border-gray-300 w-10 h-10 rounded-full"
                onClick={prevSlide}
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="bg-red-600 hover:bg-red-700 border-red-600 text-white w-10 h-10 rounded-full"
                onClick={nextSlide}
              >
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">
                <span className="text-blue-400">uth</span>
                <span className="text-red-400">bus</span>
              </h3>
              <p className="text-gray-300">
                Nepal's trusted bus booking platform. Travel safely and comfortably across the country.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Help
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Popular Routes</h4>
              <ul className="space-y-2 text-gray-300">
                <li>
                  <a href="#" className="hover:text-white">
                    Kathmandu - Pokhara
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Kathmandu - Chitwan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pokhara - Lumbini
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Kathmandu - Biratnagar
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Info</h4>
              <div className="space-y-2 text-gray-300">
                <p>📞 +977 9815355501</p>
                <p>✉️ info@uthbus.com</p>
                <p>📍 Kathmandu, Nepal</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 UthBus. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
