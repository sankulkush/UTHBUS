"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { PlusIcon, UploadIcon } from "lucide-react"
import CitySelect from "@/components/city-select"

const amenitiesList = [
  { id: "wifi", label: "Wi-Fi" },
  { id: "charger", label: "Charger" },
  { id: "recliner", label: "Recliner" },
  { id: "tv", label: "TV/Entertainment" },
  { id: "ac", label: "Air Conditioning" },
  { id: "blanket", label: "Blankets" },
  { id: "water", label: "Water Bottle" },
  { id: "snacks", label: "Snacks" },
  { id: "gps", label: "GPS Tracking" },
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

export function AddBusPage() {
  const [formData, setFormData] = useState({
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
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Fixed city selection handlers
  const handleStartPointChange = (value: string) => {
    setFormData({
      ...formData,
      startPoint: value,
    })
  }

  const handleEndPointChange = (value: string) => {
    setFormData({
      ...formData,
      endPoint: value,
    })
  }

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityId],
      })
    } else {
      setFormData({
        ...formData,
        amenities: formData.amenities.filter((id) => id !== amenityId),
      })
    }
  }

  const handleMultiSelectChange = (field: string, value: string, checked: boolean) => {
    const currentValues = formData[field as keyof typeof formData] as string[]
    if (checked) {
      setFormData({
        ...formData,
        [field]: [...currentValues, value],
      })
    } else {
      setFormData({
        ...formData,
        [field]: currentValues.filter((item) => item !== value),
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name || !formData.type || !formData.startPoint || !formData.endPoint) {
      alert("Please fill in all required fields")
      return
    }

    console.log("Bus data:", formData)
    alert("Bus added successfully!")
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <PlusIcon className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-bold text-gray-900">Add New Bus</h1>
        </div>
        <p className="text-gray-600">Register a new bus to your fleet</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Bus Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., Greenline Express 001"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Bus Model</Label>
                <Input
                  id="model"
                  name="model"
                  placeholder="e.g., Volvo 9400"
                  value={formData.model}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label>Bus Type *</Label>
                <Select onValueChange={(value) => handleSelectChange("type", value)} value={formData.type}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bus type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mini">Mini</SelectItem>
                    <SelectItem value="Coach">Coach</SelectItem>
                    <SelectItem value="Hiace">Hiace</SelectItem>
                    <SelectItem value="Deluxe">Deluxe</SelectItem>
                    <SelectItem value="Super Deluxe">Super Deluxe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>AC / Non-AC *</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="isAC"
                      checked={formData.isAC === true}
                      onChange={() => setFormData({ ...formData, isAC: true })}
                    />
                    <span>AC</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="isAC"
                      checked={formData.isAC === false}
                      onChange={() => setFormData({ ...formData, isAC: false })}
                    />
                    <span>Non-AC</span>
                  </label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route Information */}
        <Card>
          <CardHeader>
            <CardTitle>Route Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Point */}
              <div className="space-y-2">
                <Label htmlFor="startPoint">Start Point *</Label>
                <CitySelect
                  value={formData.startPoint}
                  onChange={(city) => {
                    console.log("startPoint onChange:", city);
                    setFormData({ ...formData, startPoint: city });
                  }}
                  placeholder="Select start city"
                  label=""
                />
                <pre>startPoint: {formData.startPoint || "<empty>"}</pre>
                <pre>endPoint: {formData.endPoint || "<empty>"}</pre>
              </div>

              {/* End Point */}
              <div className="space-y-2">
                <Label htmlFor="endPoint">End Point *</Label>
                <CitySelect
                  value={formData.endPoint}
                  onChange={(city) => {
                    console.log("endPoint onChange:", city);
                    setFormData({ ...formData, endPoint: city });
                  }}
                  placeholder="Select end city"
                  label=""
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Boarding Points</Label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {boardingPoints.map((point) => (
                    <div key={point} className="flex items-center space-x-2">
                      <Checkbox
                        id={`boarding-${point}`}
                        checked={formData.boardingPoints.includes(point)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange("boardingPoints", point, checked as boolean)
                        }
                      />
                      <Label htmlFor={`boarding-${point}`} className="text-sm font-normal">
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
                    <div key={point} className="flex items-center space-x-2">
                      <Checkbox
                        id={`dropping-${point}`}
                        checked={formData.droppingPoints.includes(point)}
                        onCheckedChange={(checked) =>
                          handleMultiSelectChange("droppingPoints", point, checked as boolean)
                        }
                      />
                      <Label htmlFor={`dropping-${point}`} className="text-sm font-normal">
                        {point}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities & Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {amenitiesList.map((amenity) => (
                <div key={amenity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity.id}
                    checked={formData.amenities.includes(amenity.id)}
                    onCheckedChange={(checked) => handleAmenityChange(amenity.id, checked as boolean)}
                  />
                  <Label htmlFor={amenity.id} className="text-sm font-normal">
                    {amenity.label}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Photos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Drag and drop photos here, or click to browse</p>
              <Button type="button" variant="outline">
                Choose Files
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Additional details about the bus..."
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline">
            Save as Draft
          </Button>
          <Button type="submit" className="bg-red-600 hover:bg-red-700">
            Add Bus
          </Button>
        </div>
      </form>

      {/* Debug info - remove in production */}
      <Card className="mt-8 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm">Debug Info (Remove in production)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs">
            <p><strong>Start Point:</strong> {formData.startPoint || "Not selected"}</p>
            <p><strong>End Point:</strong> {formData.endPoint || "Not selected"}</p>
            <p><strong>Bus Type:</strong> {formData.type || "Not selected"}</p>
            <p><strong>Bus Name:</strong> {formData.name || "Not entered"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}