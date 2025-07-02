"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar/sidebar"
import { MainContent } from "./main-content/main-content"
import { CounterProvider } from "./context/counter-context"
import type { MenuItem } from "./types/counter.types"

export default function CounterPortal() {
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItem>("book-ticket")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <CounterProvider>
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          activeMenuItem={activeMenuItem}
          onMenuItemChange={setActiveMenuItem}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <MainContent
          activeMenuItem={activeMenuItem}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>
    </CounterProvider>
  )
}
