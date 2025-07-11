"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  TicketIcon,
  BusIcon,
  ClipboardListIcon,
  HistoryIcon,
  MenuIcon,
  LogOutIcon,
  ChevronLeftIcon,
} from "lucide-react"
import type { MenuItem } from "../types/counter.types"
import { useCounter } from "../context/counter-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeMenuItem: MenuItem
  onMenuItemChange: (item: MenuItem) => void
  collapsed: boolean
  onToggleCollapse: () => void
}

const menuItems = [
  { id: "book-ticket" as MenuItem, label: "Book Ticket", icon: TicketIcon },
  { id: "my-buses" as MenuItem, label: "My Buses", icon: BusIcon },
  { id: "booked-transactions" as MenuItem, label: "Booked Transactions", icon: ClipboardListIcon },
  { id: "booking-history" as MenuItem, label: "Booking History", icon: HistoryIcon },
]

export function Sidebar({ activeMenuItem, onMenuItemChange, collapsed, onToggleCollapse }: SidebarProps) {
  const { operator } = useCounter()
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/operator/login')
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div
      className={cn(
        "bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-sm",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <BusIcon className="w-6 h-6 text-red-600" />
              <span className="text-lg font-bold">
                <span className="text-blue-600">uth</span>
                <span className="text-red-600">bus</span>
              </span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onToggleCollapse} className="p-1">
            {collapsed ? <MenuIcon className="w-4 h-4" /> : <ChevronLeftIcon className="w-4 h-4" />}
          </Button>
        </div>
        {!collapsed && operator && (
          <div className="mt-3 text-sm text-gray-600">
            <p className="font-medium">{operator.companyName}</p>
            <p className="text-xs">{operator.name}</p>
          </div>
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeMenuItem === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start text-left",
                  collapsed ? "px-2" : "px-3",
                  isActive ? "bg-red-600 text-white hover:bg-red-700" : "text-gray-700 hover:bg-gray-100",
                )}
                onClick={() => onMenuItemChange(item.id)}
              >
                <Icon className={cn("w-4 h-4", collapsed ? "" : "mr-3")} />
                {!collapsed && <span>{item.label}</span>}
              </Button>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn("w-full justify-start text-red-600 hover:bg-red-50", collapsed ? "px-2" : "px-3")}
          onClick={handleLogout}
        >
          <LogOutIcon className={cn("w-4 h-4", collapsed ? "" : "mr-3")} />
          {!collapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  )
}