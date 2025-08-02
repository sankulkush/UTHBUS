"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BusIcon, SettingsIcon, EyeIcon, PlusIcon } from "lucide-react"
import { useCounter } from "../context/counter-context"
import type { IBus, BusType } from "../types/counter.types"
import { BusService } from "../services/bus.service"

const cities = [
  "Kathmandu",
  "Pokhara",
  "Chitwan",
  "Lumbini",
  "Butwal",
  "Nepalgunj",
  "Dharan",
  "Biratnagar",
  "Janakpur",
  "Birgunj",
]

const amenitiesList = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "charging Point", label: "charging Point" },
  { id: "Sofa Seat", label: "Sofa Seat" },
  { id: "TV", label: "TV" },
  { id: "water", label: "Water Bottle" },
  { id: "cctv", label: "CCTV" },
]

const boardingPoints = [
  "New Bus Park",
  "Kalanki",
  "Thankot",
  "Balaju",
  "Maharajgunj",
  "Tinkune",
  "Koteshwor",
  "Bhaktapur",
]

const droppingPoints = [
  "Pokhara Bus Park",
  "Lakeside",
  "Mahendrapul", 
  "Bharatpur Bus Park",
  "Sauraha",
  "Lumbini",
  "Butwal",
  "Nepalgunj",
]

export function MyBusesPage() {
  const { buses, loading, operator, refreshData } = useCounter()
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<IBus>>({})
  const [addFormData, setAddFormData] = useState({
    name: "",
    type: "",
    model: "",
    isAC: true,
    amenities: [] as string[],
    routes: [] as string[],
    startPoint: "",
    endPoint: "",
    boardingPoints: [] as string[],
    droppingPoints: [] as string[],
    photos: [] as string[],
    description: "",
    departureTime: "",
    arrivalTime: "",
    duration: "",
    price: 0,
    seatCapacity: 0,
  })

  const busService = new BusService()

  const handleView = (bus: IBus) => {
    setSelectedBus(bus)
    setIsViewModalOpen(true)
  }

  const handleEdit = (bus: IBus) => {
    setSelectedBus(bus)
    setEditFormData(bus)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedBus) return

    try {
      await busService.updateBus(selectedBus.id, editFormData)
      alert("Bus updated successfully!")
      setIsEditModalOpen(false)
      await refreshData()
    } catch (error) {
      console.error("Error updating bus:", error)
      alert("Error updating bus")
    }
  }

  const handleAddBus = async () => {
    if (!operator) return

    if (
      !addFormData.name ||
      !addFormData.type ||
      !addFormData.startPoint ||
      !addFormData.endPoint
    ) {
      alert("Please fill in all required fields")
      return
    }

    try {
      await busService.createBus({
        ...addFormData,
        type: addFormData.type as BusType,
        operatorId: operator.uid,
        routes: [`${addFormData.startPoint}-${addFormData.endPoint}`],
        status: "Active",
        nextRoute: `${addFormData.startPoint}-${addFormData.endPoint}`,
        nextDeparture: addFormData.departureTime,
      })

      alert("Bus added successfully!")
      setIsAddModalOpen(false)
      await refreshData()

      setAddFormData({
        name: "",
        type: "",
        model: "",
        isAC: true,
        amenities: [],
        routes: [],
        startPoint: "",
        endPoint: "",
        boardingPoints: [],
        droppingPoints: [],
        photos: [],
        description: "",
        departureTime: "",
        arrivalTime: "",
        duration: "",
        price: 0,
        seatCapacity: 0,
      })
    } catch (error) {
      console.error("Error adding bus:", error)
      alert("Error adding bus")
    }
  }

  const handleAmenityChange = (
    amenityId: string,
    checked: boolean,
    isEdit = false
  ) => {
    if (isEdit) {
      const currentAmenities = editFormData.amenities || []
      if (checked) {
        setEditFormData({
          ...editFormData,
          amenities: [...currentAmenities, amenityId],
        })
      } else {
        setEditFormData({
          ...editFormData,
          amenities: currentAmenities.filter((id) => id !== amenityId),
        })
      }
    } else {
      if (checked) {
        setAddFormData({
          ...addFormData,
          amenities: [...addFormData.amenities, amenityId],
        })
      } else {
        setAddFormData({
          ...addFormData,
          amenities: addFormData.amenities.filter((id) => id !== amenityId),
        })
      }
    }
  }

  const handleMultiSelectChange = (
    field: string,
    value: string,
    checked: boolean,
    isEdit = false
  ) => {
    if (isEdit) {
      const currentValues =
        (editFormData[field as keyof IBus] as string[]) || []
      if (checked) {
        setEditFormData({
          ...editFormData,
          [field]: [...currentValues, value],
        })
      } else {
        setEditFormData({
          ...editFormData,
          [field]: currentValues.filter((item) => item !== value),
        })
      }
    } else {
      const currentValues = addFormData[
        field as keyof typeof addFormData
      ] as string[]
      if (checked) {
        setAddFormData({
          ...addFormData,
          [field]: [...currentValues, value],
        })
      } else {
        setAddFormData({
          ...addFormData,
          [field]: currentValues.filter((item) => item !== value),
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <BusIcon className="w-6 h-6 text-red-600" />
            <h1 className="text-2xl font-bold text-gray-900">My Buses</h1>
          </div>
          <p className="text-gray-600">Manage your fleet of buses</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add New Bus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Bus</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Bus Name *</Label>
                    <Input
                      id="add-name"
                      placeholder="e.g., Greenline Express 001"
                      value={addFormData.name}
                      onChange={(e) =>
                        setAddFormData({ ...addFormData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-model">Bus Model</Label>
                    <Input
                      id="add-model"
                      placeholder="e.g., Volvo 9400"
                      value={addFormData.model}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          model: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bus Type *</Label>
                    <Select
                      value={addFormData.type}
                      onValueChange={(value) =>
                        setAddFormData({ ...addFormData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bus type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Micro">Micro</SelectItem>
                        <SelectItem value="Deluxe">Deluxe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>AC / Non-AC *</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="add-isAC"
                          checked={addFormData.isAC === true}
                          onChange={() =>
                            setAddFormData({ ...addFormData, isAC: true })
                          }
                        />
                        <span>AC</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="add-isAC"
                          checked={addFormData.isAC === false}
                          onChange={() =>
                            setAddFormData({ ...addFormData, isAC: false })
                          }
                        />
                        <span>Non-AC</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-seatCapacity">Seat Capacity *</Label>
                    <Input
                      id="add-seatCapacity"
                      type="number"
                      placeholder="e.g., 40"
                      value={addFormData.seatCapacity}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          seatCapacity: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-price">Price (Rs.) *</Label>
                    <Input
                      id="add-price"
                      type="number"
                      placeholder="e.g., 1200"
                      value={addFormData.price}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Timing Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Timing Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-departureTime">Departure Time *</Label>
                    <Input
                      id="add-departureTime"
                      type="time"
                      value={addFormData.departureTime}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          departureTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-arrivalTime">Arrival Time *</Label>
                    <Input
                      id="add-arrivalTime"
                      type="time"
                      value={addFormData.arrivalTime}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          arrivalTime: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-duration">Duration</Label>
                    <Input
                      id="add-duration"
                      placeholder="e.g., 6h 30m"
                      value={addFormData.duration}
                      onChange={(e) =>
                        setAddFormData({
                          ...addFormData,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Route Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Point */}
                  <div className="space-y-2">
                    <Label htmlFor="add-startPoint">Start Point *</Label>
                    <Select
                      value={addFormData.startPoint}
                      onValueChange={(value) => {
                        console.log("[Parent] onChange startPoint:", value)
                        setAddFormData({ ...addFormData, startPoint: value })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select start city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* End Point */}
                  <div className="space-y-2">
                    <Label htmlFor="add-endPoint">End Point *</Label>
                    <Select
                      value={addFormData.endPoint}
                      onValueChange={(value) => {
                        console.log("Modal endPoint onChange:", value)
                        setAddFormData({ ...addFormData, endPoint: value })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select end city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Boarding Points</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {boardingPoints.map((point) => (
                        <div
                          key={point}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`add-boarding-${point}`}
                            checked={addFormData.boardingPoints.includes(point)}
                            onCheckedChange={(checked) =>
                              handleMultiSelectChange(
                                "boardingPoints",
                                point,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={`add-boarding-${point}`}
                            className="text-sm font-normal"
                          >
                            {point}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Dropping Points</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {droppingPoints.map((point) => (
                        <div
                          key={point}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`add-dropping-${point}`}
                            checked={addFormData.droppingPoints.includes(point)}
                            onCheckedChange={(checked) =>
                              handleMultiSelectChange(
                                "droppingPoints",
                                point,
                                checked as boolean
                              )
                            }
                          />
                          <Label
                            htmlFor={`add-dropping-${point}`}
                            className="text-sm font-normal"
                          >
                            {point}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenitiesList.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`add-${amenity.id}`}
                        checked={addFormData.amenities.includes(amenity.id)}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(amenity.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`add-${amenity.id}`}
                        className="text-sm font-normal"
                      >
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddBus}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Add Bus
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {buses.map((bus) => (
          <Card key={bus.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                {/* Bus Info */}
                <div className="lg:col-span-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {bus.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {bus.type} • {bus.model}
                  </p>
                  <div className="flex items-center space-x-2">
                    <Badge variant={bus.isAC ? "default" : "secondary"}>
                      {bus.isAC ? "AC" : "Non-AC"}
                    </Badge>
                    <Badge
                      variant={
                        bus.status === "Active" ? "default" : "secondary"
                      }
                    >
                      {bus.status}
                    </Badge>
                    <Badge variant="outline">
                      Rs. {bus.price?.toLocaleString()}
                    </Badge>
                  </div>
                </div>

                {/* Route Info */}
                <div className="lg:col-span-3">
                  <p className="text-sm text-gray-600 mb-1">Route:</p>
                  <p className="font-medium text-gray-900">
                    {bus.startPoint} → {bus.endPoint}
                  </p>
                  <p className="text-sm text-gray-600">
                    {bus.departureTime} - {bus.arrivalTime}
                  </p>
                </div>

                {/* Amenities */}
                <div className="lg:col-span-3">
                  <p className="text-sm text-gray-600 mb-1">Amenities:</p>
                  <div className="flex flex-wrap gap-1">
                    {bus.amenities.slice(0, 3).map((amenity, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                    {bus.amenities.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{bus.amenities.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-2 flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleView(bus)}
                  >
                    <EyeIcon className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(bus)}
                  >
                    <SettingsIcon className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {buses.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <BusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No buses found
              </h3>
              <p className="text-gray-600 mb-4">
                Start by adding your first bus to the fleet
              </p>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-red-600 hover:bg-red-700"
              >
                Add Your First Bus
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View Bus Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Bus Details</DialogTitle>
          </DialogHeader>
          {selectedBus && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Bus Name
                  </Label>
                  <p className="text-lg font-semibold">{selectedBus.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Type
                  </Label>
                  <p className="text-lg">{selectedBus.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Model
                  </Label>
                  <p className="text-lg">{selectedBus.model}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    AC Status
                  </Label>
                  <p className="text-lg">
                    {selectedBus.isAC ? "AC" : "Non-AC"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Departure Time
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedBus.departureTime}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Arrival Time
                  </Label>
                  <p className="text-lg font-semibold">
                    {selectedBus.arrivalTime}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Duration
                  </Label>
                  <p className="text-lg">{selectedBus.duration}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Price
                  </Label>
                  <p className="text-xl font-bold text-red-600">
                    Rs. {selectedBus.price?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-600">
                    Seat Capacity
                  </Label>
                  <p className="text-lg">{selectedBus.seatCapacity}</p>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Route
                </Label>
                <p className="text-lg">
                  {selectedBus.startPoint} → {selectedBus.endPoint}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Amenities
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBus.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Boarding Points
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBus.boardingPoints.map((point, index) => (
                    <Badge key={index} variant="secondary">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">
                  Dropping Points
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedBus.droppingPoints.map((point, index) => (
                    <Badge key={index} variant="secondary">
                      {point}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Bus Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bus</DialogTitle>
          </DialogHeader>
          {selectedBus && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Bus Name</Label>
                  <Input
                    id="edit-name"
                    value={editFormData.name || ""}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-model">Bus Model</Label>
                  <Input
                    id="edit-model"
                    value={editFormData.model || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        model: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-departureTime">Departure Time</Label>
                  <Input
                    id="edit-departureTime"
                    type="time"
                    value={editFormData.departureTime || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        departureTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-arrivalTime">Arrival Time</Label>
                  <Input
                                        id="edit-arrivalTime"
                    type="time"
                    value={editFormData.arrivalTime || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        arrivalTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (Rs.)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editFormData.price || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        price: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-seatCapacity">Seat Capacity</Label>
                  <Input
                    id="edit-seatCapacity"
                    type="number"
                    value={editFormData.seatCapacity || ""}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        seatCapacity: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bus Type</Label>
                  <Select
                    value={editFormData.type || ""}
                    onValueChange={(value) =>
                      setEditFormData({ ...editFormData, type: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Micro">Micro</SelectItem>
                      <SelectItem value="Deluxe">Deluxe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>AC Status</Label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="edit-isAC"
                        checked={editFormData.isAC === true}
                        onChange={() =>
                          setEditFormData({ ...editFormData, isAC: true })
                        }
                      />
                      <span>AC</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="edit-isAC"
                        checked={editFormData.isAC === false}
                        onChange={() =>
                          setEditFormData({ ...editFormData, isAC: false })
                        }
                      />
                      <span>Non-AC</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600 mb-3 block">
                  Amenities
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {amenitiesList.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`edit-${amenity.id}`}
                        checked={(editFormData.amenities || []).includes(
                          amenity.id
                        )}
                        onCheckedChange={(checked) =>
                          handleAmenityChange(
                            amenity.id,
                            checked as boolean,
                            true
                          )
                        }
                      />
                      <Label
                        htmlFor={`edit-${amenity.id}`}
                        className="text-sm font-normal"
                      >
                        {amenity.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}