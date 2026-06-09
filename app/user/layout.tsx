"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { User, TicketIcon } from "lucide-react"
import UserAuthGuard from "@/components/auth/UserAuthGuard"

const sidebarItems = [
  { title: "My Bookings", href: "/user/bookings", icon: TicketIcon },
  { title: "Profile",     href: "/user/profile",  icon: User },
]

function SidebarNav({ horizontal = false }: { horizontal?: boolean }) {
  const pathname = usePathname()

  if (horizontal) {
    return (
      <nav className="flex gap-1 p-1 min-w-max">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              {item.title}
            </Link>
          )
        })}
      </nav>
    )
  }

  return (
    <nav className="space-y-0.5 p-2">
      {sidebarItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
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
  return (
    <UserAuthGuard>
      <div className="min-h-screen bg-muted/30 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">

            {/* Sidebar — horizontal pill-strip on mobile, vertical card on desktop */}
            <aside className="w-full lg:w-64 lg:flex-shrink-0">
              {/* Mobile: horizontal scrollable nav strip */}
              <div className="lg:hidden overflow-x-auto pb-1">
                <SidebarNav horizontal />
              </div>
              {/* Desktop: vertical sticky card */}
              <Card className="hidden lg:block sticky top-24">
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
