"use client"

import { useState } from "react"
import { useUserAuth } from "@/contexts/user-auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Edit,
  Save,
  X
} from "lucide-react"

export default function ProfilePage() {
  const { userProfile, updateProfile } = useUserAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    fullName: userProfile?.fullName || "",
    phoneNumber: userProfile?.phoneNumber || "",
    dateOfBirth: userProfile?.dateOfBirth || ""
  })
  const [isSaving, setIsSaving] = useState(false)

  if (!userProfile) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Not Found</h3>
            <p className="text-gray-600">Unable to load your profile information.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const initials = userProfile.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
    : userProfile.email[0].toUpperCase()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        ...userProfile,
        ...editForm
      })
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditForm({
      fullName: userProfile.fullName || "",
      phoneNumber: userProfile.phoneNumber || "",
      dateOfBirth: userProfile.dateOfBirth || ""
    })
    setIsEditing(false)
  }

  return (
    <>
      {/* Header */}
      <div className="border-b p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Profile</h1>
      </div>

      <div className="p-4 sm:p-6">
        {/* Profile Card */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
              <AvatarImage src={userProfile.email} alt={userProfile.fullName} />
              <AvatarFallback className="text-lg sm:text-xl bg-red-100 text-red-600">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {userProfile.fullName || "No name provided"}
              </h3>
              <p className="text-gray-600">{userProfile.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(userProfile.createdAt?.toDate ? userProfile.createdAt.toDate() : userProfile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              {isEditing ? (
                <Input
                  id="fullName"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {userProfile.fullName || "Not provided"}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 truncate">{userProfile.email}</span>
              </div>
              <p className="text-xs text-gray-500">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  placeholder="Enter your phone number"
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {userProfile.phoneNumber || "Not provided"}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              {isEditing ? (
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                />
              ) : (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900">
                    {userProfile.dateOfBirth 
                      ? new Date(userProfile.dateOfBirth).toLocaleDateString()
                      : "Not provided"
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Account Statistics */}
          <div className="pt-6 border-t">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-4 text-center">
                  <h5 className="text-2xl font-bold text-red-600">0</h5>
                  <p className="text-sm text-gray-600">Total Bookings</p>
                </CardContent>
              </Card>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4 text-center">
                  <h5 className="text-2xl font-bold text-blue-600">Rs. 0</h5>
                  <p className="text-sm text-gray-600">Amount Spent</p>
                </CardContent>
              </Card>
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4 text-center">
                  <h5 className="text-2xl font-bold text-green-600">Rs. 0</h5>
                  <p className="text-sm text-gray-600">UthBus Cash</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}