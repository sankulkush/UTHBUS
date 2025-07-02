"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { MenuIcon } from "lucide-react"
import type { MenuItem } from "../types/counter.types"
import { BookTicketPage } from "../pages/book-ticket.page"
import { MyBusesPage } from "../pages/my-buses.page"
import { BookedTransactionsPage } from "../pages/booked-transactions.page"
import { BookingHistoryPage } from "../pages/booking-history.page"

interface MainContentProps {
  activeMenuItem: MenuItem
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

const pageComponents: Record<MenuItem, React.ComponentType> = {
  "book-ticket": BookTicketPage,
  "my-buses": MyBusesPage,
  "booked-transactions": BookedTransactionsPage,
  "booking-history": BookingHistoryPage,
}

export function MainContent({ activeMenuItem, sidebarCollapsed, onToggleSidebar }: MainContentProps) {
  const PageComponent = pageComponents[activeMenuItem]

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <Button variant="ghost" size="sm" onClick={onToggleSidebar}>
          <MenuIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* Page Content */}
      <div className="flex-1 overflow-auto">
        <PageComponent />
      </div>
    </div>
  )
}
