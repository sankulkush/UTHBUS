"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar/sidebar";
import { MainContent } from "./main-content/main-content";
import { CounterProvider } from "./context/counter-context";
import type { ActiveSection } from "./types/counter.types";

export default function CounterPortal() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <CounterProvider>
      <div className="flex h-screen bg-muted/30 overflow-hidden">
        {/* Mobile backdrop */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
          mobileOpen={mobileSidebarOpen}
          onMobileClose={() => setMobileSidebarOpen(false)}
        />

        <MainContent
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />
      </div>
    </CounterProvider>
  );
}
