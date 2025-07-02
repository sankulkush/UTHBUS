"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BusIcon,
  PlusIcon,
  RouteIcon,
  UsersIcon,
  TrendingUpIcon,
  SettingsIcon,
  LogOutIcon,
  MapPinIcon,
  CalendarIcon,
} from "lucide-react"
import Link from "next/link"

const mockOperatorData = {
  name: "Greenline Tours",
  totalBuses: 12,
  activeRoutes: 8,
  todayBookings: 45,
  monthlyRevenue: 125000,
  recentBuses: [
    {
      id: 1,
      name: "GL-001",
      route: "Kathmandu - Pokhara",
      status: "Active",
      lastTrip: "2 hours ago",
    },
    {
      id: 2,
      name: "GL-002",
      route: "Kathmandu - Chitwan",
      status: "Maintenance",
      lastTrip: "1 day ago",
    },
    {
      id: 3,
      name: "GL-003",
      route: "Pokhara - Lumbini",
      status: "Active",
      lastTrip: "30 minutes ago",
    },
  ],
  recentBookings: [
    {
      id: 1,
      passenger: "Ram Sharma",
      route: "Kathmandu - Pokhara",
      date: "Today",
      amount: 1200,
      status: "Confirmed",
    },
    {
      id: 2,
      passenger: "Sita Devi",
      route: "Kathmandu - Chitwan",
      date: "Tomorrow",
      amount: 800,
      status: "Pending",
    },
  ],
}

export default function OperatorDashboard() {
  const [operator] = useState(mockOperatorData)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <BusIcon className="w-6 h-6 text-red-600" />
                <span className="text-xl font-bold">
                  <span className="text-blue-600">uth</span>
                  <span className="text-red-600">bus</span>
                  <span className="text-xs text-gray-500 ml-1">OPERATOR</span>
                </span>
              </Link>
              <div className="hidden md:block h-6 w-px bg-gray-300"></div>
              <div className="hidden md:block">
                <h1 className="text-lg font-semibold text-gray-800">{operator.name}</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button variant="ghost" size="sm">
                <LogOutIcon className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Buses</p>
                  <p className="text-2xl font-bold text-gray-900">{operator.totalBuses}</p>
                </div>
                <BusIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Routes</p>
                  <p className="text-2xl font-bold text-gray-900">{operator.activeRoutes}</p>
                </div>
                <RouteIcon className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{operator.todayBookings}</p>
                </div>
                <UsersIcon className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">Rs. {operator.monthlyRevenue.toLocaleString()}</p>
                </div>
                <TrendingUpIcon className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/operator/add-bus">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-blue-500">
              <CardContent className="p-6 text-center">
                <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Add New Bus</h3>
                <p className="text-sm text-gray-600">Register a new bus to your fleet</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/operator/routes">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-green-500">
              <CardContent className="p-6 text-center">
                <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Manage Routes</h3>
                <p className="text-sm text-gray-600">Add or modify bus routes</p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-dashed border-gray-300 hover:border-purple-500">
            <CardContent className="p-6 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Schedule Trips</h3>
              <p className="text-sm text-gray-600">Set departure times and availability</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Buses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Buses</span>
                <Link href="/operator/buses">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operator.recentBuses.map((bus) => (
                  <div key={bus.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <BusIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{bus.name}</p>
                        <p className="text-sm text-gray-600">{bus.route}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={bus.status === "Active" ? "default" : "secondary"}>{bus.status}</Badge>
                      <p className="text-xs text-gray-500 mt-1">{bus.lastTrip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Bookings</span>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operator.recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <UsersIcon className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-900">{booking.passenger}</p>
                        <p className="text-sm text-gray-600">{booking.route}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">Rs. {booking.amount}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={booking.status === "Confirmed" ? "default" : "secondary"}>
                          {booking.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{booking.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
