// app/operator/counter/page.tsx
"use client"

import { useState } from "react"
import { CounterProvider } from "@/components/operator/counter/context/counter-context"
import { Sidebar } from "@/components/operator/counter/sidebar/sidebar"
import { MainContent } from "@/components/operator/counter/main-content/main-content"
import type { MenuItem } from "@/components/operator/counter/types/counter.types"

export default function CounterPage() {
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>("book-ticket")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleMenuItemChange = (item: MenuItem) => {
    setActiveMenuItem(item)
  }

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <CounterProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <Sidebar
          activeMenuItem={activeMenuItem}
          onMenuItemChange={handleMenuItemChange}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />

        {/* Main Content */}
        <MainContent
          activeMenuItem={activeMenuItem}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={handleToggleSidebar}
        />
      </div>
    </CounterProvider>
  )
}