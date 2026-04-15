"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  User,
  TicketIcon,
  CreditCard,
  Gift,
  MapPin,
  Bell,
  ChevronDown,
} from "lucide-react"
import UserAuthGuard from "@/components/Auth/UserAuthGuard"

const sidebarItems = [
  { title: "My Bookings",      href: "/user/bookings",      icon: TicketIcon },
  { title: "UthBus Cash",      href: "/user/credits",       icon: CreditCard },
  { title: "Refer A Friend",   href: "/user/refer-friend",  icon: Gift },
  { title: "Profile",          href: "/user/profile",       icon: User },
  { title: "Billing Address",  href: "/user/billing",       icon: MapPin },
  { title: "Notification",     href: "/user/notifications", icon: Bell },
]

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="space-y-0.5 p-2">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 flex-shrink-0 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground/70"
              )}
            />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Mobile menu toggle */}
            <div className="lg:hidden">
              <Button
                variant="outline"
                onClick={() => setMobileOpen(!mobileOpen)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Account Menu
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    mobileOpen && "rotate-180"
                  )}
                />
              </Button>

              {mobileOpen && (
                <Card className="mt-2 animate-slide-up">
                  <SidebarNav onNavigate={() => setMobileOpen(false)} />
                </Card>
              )}
            </div>

            {/* Desktop sidebar */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <Card className="sticky top-24">
                <SidebarNav />
              </Card>
            </aside>

            {/* Main content */}
            <main className="flex-1 min-w-0">
              <Card className="shadow-soft">
                {children}
              </Card>
            </main>

          </div>
        </div>
      </div>
    </UserAuthGuard>
  )
}
