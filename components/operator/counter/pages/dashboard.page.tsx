"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TicketIcon, ClockIcon, DollarSignIcon, TrendingUpIcon, BusIcon, CheckCircleIcon } from "lucide-react"
import { useCounter } from "../context/counter-context"

export function DashboardPage() {
  const { dashboardStats, loading } = useCounter()

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardStats) return null

  const stats = [
    {
      title: "Today's Bookings",
      value: dashboardStats.todayBookings,
      icon: TicketIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Pending Departures",
      value: dashboardStats.pendingDepartures,
      icon: ClockIcon,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Today's Revenue",
      value: `Rs. ${dashboardStats.todayRevenue.toLocaleString()}`,
      icon: DollarSignIcon,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Monthly Revenue",
      value: `Rs. ${dashboardStats.monthlyRevenue.toLocaleString()}`,
      icon: TrendingUpIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Buses",
      value: dashboardStats.totalBuses,
      icon: BusIcon,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Active Buses",
      value: dashboardStats.activeBuses,
      icon: CheckCircleIcon,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your bus operations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { passenger: "Ram Sharma", route: "Kathmandu-Pokhara", time: "2 hours ago", status: "Confirmed" },
                { passenger: "Sita Devi", route: "Kathmandu-Chitwan", time: "3 hours ago", status: "Pending" },
                { passenger: "Hari Bahadur", route: "Pokhara-Kathmandu", time: "5 hours ago", status: "Confirmed" },
              ].map((booking, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{booking.passenger}</p>
                    <p className="text-sm text-gray-600">{booking.route}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={booking.status === "Confirmed" ? "default" : "secondary"}>{booking.status}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{booking.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Departures</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { bus: "GL-001", route: "Kathmandu-Pokhara", time: "07:00 AM", passengers: 28 },
                { bus: "GL-002", route: "Kathmandu-Chitwan", time: "09:00 AM", passengers: 15 },
                { bus: "GL-003", route: "Pokhara-Kathmandu", time: "02:00 PM", passengers: 32 },
              ].map((departure, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{departure.bus}</p>
                    <p className="text-sm text-gray-600">{departure.route}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{departure.time}</p>
                    <p className="text-xs text-gray-500">{departure.passengers} passengers</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
