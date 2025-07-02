"use client"

import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, Users, Building, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface PendingOperator {
  id: string
  email: string
  companyName: string
  contactNumber: string
  address: string
  description: string
  createdAt: any
  approved: boolean
}

export default function AdminPanel() {
  const { user, userData, loading } = useAuth()
  const [pendingOperators, setPendingOperators] = useState<PendingOperator[]>([])
  const [loadingOperators, setLoadingOperators] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      router.push("/")
    }
  }, [user, userData, loading, router])

  useEffect(() => {
    if (userData?.role === "admin") {
      fetchPendingOperators()
    }
  }, [userData])

  const fetchPendingOperators = async () => {
    try {
      const q = query(collection(firestore, "operators"), where("approved", "==", false))
      const querySnapshot = await getDocs(q)
      const operators: PendingOperator[] = []

      querySnapshot.forEach((doc) => {
        operators.push({
          id: doc.id,
          ...doc.data(),
        } as PendingOperator)
      })

      setPendingOperators(operators)
    } catch (error) {
      console.error("Error fetching operators:", error)
    } finally {
      setLoadingOperators(false)
    }
  }

  const handleApproval = async (operatorId: string, approved: boolean) => {
    setProcessingId(operatorId)
    try {
      await updateDoc(doc(firestore, "operators", operatorId), {
        approved: approved,
        approvedAt: new Date(),
      })

      // Remove from pending list
      setPendingOperators((prev) => prev.filter((op) => op.id !== operatorId))

      // TODO: Send email notification to operator
    } catch (error) {
      console.error("Error updating operator:", error)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading || loadingOperators) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  if (!user || userData?.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-bold">
                  <span className="text-blue-600">uth</span>
                  <span className="text-red-600">bus</span>
                </span>
              </Link>
              <Badge variant="secondary">Admin Panel</Badge>
            </div>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage operator applications and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">{pendingOperators.length}</p>
                  <p className="text-gray-600">Pending Approvals</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-gray-600">Active Operators</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-2xl font-bold">150</p>
                  <p className="text-gray-600">Total Users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Operators */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Operator Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingOperators.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <p className="text-gray-600">No pending applications</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pendingOperators.map((operator) => (
                  <div key={operator.id} className="border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{operator.companyName}</h3>
                        <p className="text-gray-600">{operator.email}</p>
                        <p className="text-sm text-gray-500">
                          Applied on {new Date(operator.createdAt?.toDate()).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700">Contact Number</p>
                        <p className="text-sm text-gray-600">{operator.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Address</p>
                        <p className="text-sm text-gray-600">{operator.address}</p>
                      </div>
                    </div>

                    {operator.description && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700">Description</p>
                        <p className="text-sm text-gray-600">{operator.description}</p>
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleApproval(operator.id, true)}
                        disabled={processingId === operator.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {processingId === operator.id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleApproval(operator.id, false)}
                        disabled={processingId === operator.id}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
