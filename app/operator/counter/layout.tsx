// app/operator/counter/layout.tsx
"use client"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, Bus, Calendar, BarChart3 } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"

export default function CounterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { operator, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const navigationItems = [
    { href: "/operator/counter", label: "Dashboard", icon: BarChart3 },
    { href: "/operator/counter/buses", label: "Buses", icon: Bus },
    { href: "/operator/counter/bookings", label: "Bookings", icon: Calendar },
    { href: "/operator/profile", label: "Profile", icon: User },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                UTHBUS Operator
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {operator?.name || operator?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                    isActive
                      ? "text-red-600 border-red-600"
                      : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}