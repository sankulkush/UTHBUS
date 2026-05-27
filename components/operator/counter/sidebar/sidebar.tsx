"use client";

import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Route,
  Bus,
  Map,
  Grid3x3,
  BarChart3,
  Bell,
  Settings,
  Ticket,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import type { ActiveSection } from "../types/counter.types";
import { useCounter } from "../context/counter-context";
import { useOperatorAuth } from "@/contexts/operator-auth-context";
import { useRouter } from "next/navigation";

interface SidebarProps {
  activeSection: ActiveSection;
  onSectionChange: (s: ActiveSection) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { id: "dashboard" as ActiveSection, label: "Dashboard", icon: LayoutDashboard, group: "main" },
  { id: "bookings" as ActiveSection, label: "Bookings", icon: BookOpen, group: "main" },
  { id: "book-ticket" as ActiveSection, label: "Book Ticket", icon: Ticket, group: "main" },
  { id: "trips" as ActiveSection, label: "Trips", icon: Route, group: "ops" },
  { id: "buses" as ActiveSection, label: "Buses", icon: Bus, group: "ops" },
  { id: "routes" as ActiveSection, label: "Routes", icon: Map, group: "ops" },
  { id: "seats" as ActiveSection, label: "Seats", icon: Grid3x3, group: "ops" },
  { id: "reports" as ActiveSection, label: "Reports", icon: BarChart3, group: "more" },
  { id: "notifications" as ActiveSection, label: "Notifications", icon: Bell, group: "more" },
  { id: "settings" as ActiveSection, label: "Settings", icon: Settings, group: "more" },
];

const groups = [
  { key: "main", label: "Operations" },
  { key: "ops", label: "Management" },
  { key: "more", label: "More" },
];

export function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const { operator, unreadCount } = useCounter();
  const { logout } = useOperatorAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/operator/login");
    } catch {}
  };

  const handleSelect = (id: ActiveSection) => {
    onSectionChange(id);
    onMobileClose();
  };

  const SidebarInner = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border shrink-0">
        {!collapsed && (
          <div className="flex items-center gap-2 min-w-0">
            {/* Drop the final brand logo at /public/placeholder-logo.png */}
            <img
              src="/placeholder-logo.png"
              alt="UthBus"
              className="w-8 h-8 rounded-lg object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight truncate">
                <span className="text-blue-600 dark:text-blue-400">uth</span>
                <span className="text-primary">bus</span>
              </p>
              <p className="text-[10px] text-muted-foreground truncate">Operator Portal</p>
            </div>
          </div>
        )}
        {collapsed && (
          <img
            src="/placeholder-logo.png"
            alt="UthBus"
            className="w-8 h-8 rounded-lg object-contain mx-auto"
          />
        )}
        <button
          onClick={collapsed ? onToggleCollapse : onToggleCollapse}
          className="hidden lg:flex w-7 h-7 rounded-md hover:bg-muted items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        <button
          onClick={onMobileClose}
          className="lg:hidden w-7 h-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Operator info */}
      {!collapsed && operator && (
        <div className="px-4 py-3 border-b border-border shrink-0">
          <p className="text-xs font-semibold text-foreground truncate">
            {operator.companyName || operator.name}
          </p>
          <p className="text-[11px] text-muted-foreground truncate">{operator.email}</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {groups.map((group) => {
          const items = navItems.filter((i) => i.group === group.key);
          return (
            <div key={group.key}>
              {!collapsed && (
                <p className="px-2 mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const badge = item.id === "notifications" && unreadCount > 0 ? unreadCount : 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id)}
                      className={cn(
                        "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium transition-all group",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        collapsed && "justify-center px-2"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <div className="relative shrink-0">
                        <Icon className="w-4 h-4" />
                        {badge > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                            {badge > 9 ? "9+" : badge}
                          </span>
                        )}
                      </div>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && badge > 0 && (
                        <span className="ml-auto shrink-0 px-1.5 py-0.5 rounded-full bg-destructive text-white text-[10px] font-bold">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-border shrink-0">
        <button
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all",
            collapsed && "justify-center"
          )}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 shrink-0",
          collapsed ? "w-[60px]" : "w-56"
        )}
      >
        <SidebarInner />
      </aside>

      {/* Mobile sidebar overlay */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-card border-r border-border lg:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarInner />
      </aside>
    </>
  );
}
