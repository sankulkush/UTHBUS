"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  User, 
  BookOpen, 
  MapPin, 
  CreditCard, 
  Gift, 
  Bell,
  TicketIcon,
  Users
} from "lucide-react"
import UserAuthGuard from "@/components/Auth/UserAuthGuard"

const sidebarItems = [
  {
    title: "My Bookings",
    href: "/user/bookings",
    icon: TicketIcon
  },
  {
    title: "UthBus Cash",
    href: "/user/credits",
    icon: CreditCard
  },
  {
    title: "Refer A Friend",
    href: "/user/refer-friend",
    icon: Gift
  },
  {
    title: "Profile",
    href: "/user/profile", 
    icon: User
  },
  {
    title: "Billing Address",
    href: "/user/billing",
    icon: MapPin
  },
  {
    title: "Notification",
    href: "/user/notifications",
    icon: Bell
  }
]

export default function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="w-full justify-start"
              >
                <User className="w-4 h-4 mr-2" />
                Account Menu
              </Button>
            </div>

            {/* Sidebar - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <Card className="shadow-lg">
                <CardContent className="p-0">
                  <nav className="divide-y divide-gray-100">
                    {sidebarItems.map((item, index) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center space-x-3 p-4 transition-colors hover:bg-gray-50",
                            isActive 
                              ? "bg-red-50 text-red-600 border-r-4 border-red-600" 
                              : "text-gray-700 hover:text-red-600",
                            index === 0 ? "rounded-t-lg" : "",
                            index === sidebarItems.length - 1 ? "rounded-b-lg" : ""
                          )}
                        >
                          <Icon 
                            className={cn(
                              "w-5 h-5 flex-shrink-0",
                              isActive ? "text-red-600" : "text-gray-400"
                            )} 
                          />
                          <span className={cn(
                            "font-medium text-sm",
                            isActive ? "text-red-600" : "text-gray-900"
                          )}>
                            {item.title}
                          </span>
                        </Link>
                      )
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* Mobile Sidebar */}
            {isMobileMenuOpen && (
              <div className="lg:hidden">
                <Card className="shadow-lg">
                  <CardContent className="p-0">
                    <nav className="divide-y divide-gray-100">
                      {sidebarItems.map((item, index) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center space-x-3 p-4 transition-colors hover:bg-gray-50",
                              isActive 
                                ? "bg-red-50 text-red-600 border-r-4 border-red-600" 
                                : "text-gray-700 hover:text-red-600",
                              index === 0 ? "rounded-t-lg" : "",
                              index === sidebarItems.length - 1 ? "rounded-b-lg" : ""
                            )}
                          >
                            <Icon 
                              className={cn(
                                "w-5 h-5 flex-shrink-0",
                                isActive ? "text-red-600" : "text-gray-400"
                              )} 
                            />
                            <span className={cn(
                              "font-medium text-sm",
                              isActive ? "text-red-600" : "text-gray-900"
                            )}>
                              {item.title}
                            </span>
                          </Link>
                        )
                      })}
                    </nav>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <Card className="shadow-lg">
                {children}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </UserAuthGuard>
  )
}