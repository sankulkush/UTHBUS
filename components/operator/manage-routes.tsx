"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BusIcon, ArrowLeftIcon, PlusIcon, MapPinIcon, ClockIcon, DollarSignIcon } from "lucide-react"
import Link from "next/link"
import CitySelect from "@/components/city-select"

const mockRoutes = [
  {
    id: 1,
    from: "Kathmandu",
    to: "Pokhara",
    distance: "200 km",
    duration: "6-7 hours",
    price: 1200,
    status: "Active",
    buses: ["GL-001", "GL-002"],
    departureTime: "07:00",
  },
  {
    id: 2,
    from: "Kathmandu",
    to: "Chitwan",
    distance: "150 km",
    duration: "4-5 hours",
    price: 800,
    status: "Active",
    buses: ["GL-003"],
    departureTime: "09:00",
  },
]

export default function ManageRoutes() {
  const [routes, setRoutes] = useState(mockRoutes)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newRoute, setNewRoute] = useState({
    from: "",
    to: "",
    distance: "",
    duration: "",
    price: "",
    departureTime: "",
    busId: "",
  })

  const handleAddRoute = () => {
    if (!newRoute.from || !newRoute.to || !newRoute.price) {
      alert("Please fill in all required fields")
      return
    }

    const route = {
      id: routes.length + 1,
      from: newRoute.from,
      to: newRoute.to,
      distance: newRoute.distance,
      duration: newRoute.duration,
      price: Number.parseInt(newRoute.price),
      status: "Active",
      buses: [newRoute.busId],
      departureTime: newRoute.departureTime,
    }

    setRoutes([...routes, route])
    setNewRoute({
      from: "",
      to: "",
      distance: "",
      duration: "",
      price: "",
      departureTime: "",
      busId: "",
    })
    setShowAddForm(false)
    alert("Route added successfully!")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/operator" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800">
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <BusIcon className="w-6 h-6 text-red-600" />
              <span className="text-xl font-bold">
                <span className="text-blue-600">uth</span>
                <span className="text-red-600">bus</span>
                <span className="text-xs text-gray-500 ml-1">OPERATOR</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Routes</h1>
              <p className="text-gray-600">Add and manage your bus routes</p>
            </div>
            <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-red-600 hover:bg-red-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Route
            </Button>
          </div>

          {/* Add Route Form */}
          {showAddForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Add New Route</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>From City *</Label>
                    <div className="border rounded-md">
                      <CitySelect
                        value={newRoute.from}
                        onChange={(value) => setNewRoute({ ...newRoute, from: value })}
                        placeholder="Select departure city"
                        label=""
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>To City *</Label>
                    <div className="border rounded-md">
                      <CitySelect
                        value={newRoute.to}
                        onChange={(value) => setNewRoute({ ...newRoute, to: value })}
                        placeholder="Select destination city"
                        label=""
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance</Label>
                    <Input
                      id="distance"
                      placeholder="e.g., 200 km"
                      value={newRoute.distance}
                      onChange={(e) => setNewRoute({ ...newRoute, distance: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      placeholder="e.g., 6-7 hours"
                      value={newRoute.duration}
                      onChange={(e) => setNewRoute({ ...newRoute, duration: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Rs.) *</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 1200"
                      value={newRoute.price}
                      onChange={(e) => setNewRoute({ ...newRoute, price: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="departureTime">Departure Time</Label>
                    <Input
                      id="departureTime"
                      type="time"
                      value={newRoute.departureTime}
                      onChange={(e) => setNewRoute({ ...newRoute, departureTime: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRoute} className="bg-red-600 hover:bg-red-700">
                    Add Route
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Routes List */}
          <div className="space-y-6">
            {routes.map((route) => (
              <Card key={route.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                    {/* Route Info */}
                    <div className="lg:col-span-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <MapPinIcon className="w-5 h-5 text-blue-600" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {route.from} → {route.to}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {route.distance} • {route.duration}
                          </p>
                        </div>
                      </div>
                      <Badge variant={route.status === "Active" ? "default" : "secondary"}>{route.status}</Badge>
                    </div>

                    {/* Time & Price */}
                    <div className="lg:col-span-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Departure: {route.departureTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSignIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-lg font-semibold text-gray-900">Rs. {route.price}</span>
                      </div>
                    </div>

                    {/* Assigned Buses */}
                    <div className="lg:col-span-3">
                      <p className="text-sm text-gray-600 mb-2">Assigned Buses:</p>
                      <div className="flex flex-wrap gap-1">
                        {route.buses.map((bus, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {bus}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="lg:col-span-2 flex space-x-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {routes.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <MapPinIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No routes added yet</h3>
                <p className="text-gray-600 mb-4">Start by adding your first bus route</p>
                <Button onClick={() => setShowAddForm(true)} className="bg-red-600 hover:bg-red-700">
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Add Your First Route
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
