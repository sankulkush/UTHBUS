"use client";

import React, { lazy, Suspense } from "react";
import { Menu, Loader2 } from "lucide-react";
import type { ActiveSection } from "../types/counter.types";
import { BookTicketPage } from "../pages/book-ticket.page";

// Lazy-load heavier pages
const DashboardPage = lazy(() => import("../pages/dashboard.page").then((m) => ({ default: m.DashboardPage })));
const BookingsPage = lazy(() => import("../pages/bookings.page").then((m) => ({ default: m.BookingsPage })));
const BusesPage = lazy(() => import("../pages/buses.page").then((m) => ({ default: m.BusesPage })));
const TripsPage = lazy(() => import("../pages/trips.page").then((m) => ({ default: m.TripsPage })));
const RoutesPage = lazy(() => import("../pages/routes.page").then((m) => ({ default: m.RoutesPage })));
const SeatsPage = lazy(() => import("../pages/seats.page").then((m) => ({ default: m.SeatsPage })));
const ReportsPage = lazy(() => import("../pages/reports.page").then((m) => ({ default: m.ReportsPage })));
const NotificationsPage = lazy(() => import("../pages/notifications.page").then((m) => ({ default: m.NotificationsPage })));
const SettingsPage = lazy(() => import("../pages/settings.page").then((m) => ({ default: m.SettingsPage })));

interface MainContentProps {
  activeSection: ActiveSection;
  onSectionChange: (s: ActiveSection) => void;
  onToggleMobileSidebar: () => void;
}

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center h-full">
      <Loader2 className="w-6 h-6 text-primary animate-spin" />
    </div>
  );
}

export function MainContent({ activeSection, onSectionChange, onToggleMobileSidebar }: MainContentProps) {
  const renderPage = () => {
    switch (activeSection) {
      case "dashboard":    return <DashboardPage onSectionChange={onSectionChange} />;
      case "bookings":     return <BookingsPage />;
      case "book-ticket":  return <BookTicketPage />;
      case "trips":        return <TripsPage />;
      case "buses":        return <BusesPage />;
      case "routes":       return <RoutesPage />;
      case "seats":        return <SeatsPage />;
      case "reports":      return <ReportsPage />;
      case "notifications":return <NotificationsPage />;
      case "settings":     return <SettingsPage />;
      default:             return <DashboardPage onSectionChange={onSectionChange} />;
    }
  };

  const sectionTitles: Record<ActiveSection, string> = {
    dashboard: "Dashboard",
    bookings: "Bookings",
    "book-ticket": "Book Ticket",
    trips: "Trips",
    buses: "Buses",
    routes: "Routes",
    seats: "Seats",
    reports: "Reports",
    notifications: "Notifications",
    settings: "Settings",
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border bg-card shrink-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground"
        >
          <Menu className="w-4 h-4" />
        </button>
        <h1 className="text-sm font-semibold text-foreground">{sectionTitles[activeSection]}</h1>
      </header>

      {/* Page content */}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={<PageLoader />}>
          {renderPage()}
        </Suspense>
      </div>
    </div>
  );
}
