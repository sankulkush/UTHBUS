"use client";

import { useMemo } from "react";
import {
  BookOpen, Bus, TrendingUp, Users, ArrowRight, Clock,
  CheckCircle2, XCircle, AlertCircle, Ticket, RefreshCw,
} from "lucide-react";
import { useCounter } from "../context/counter-context";
import type { ActiveSection } from "../types/counter.types";

interface Props {
  onSectionChange: (s: ActiveSection) => void;
}

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function statusColor(status: string) {
  switch (status) {
    case "booked": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50";
    case "completed": return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50";
    case "cancelled": return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50";
    default: return "text-muted-foreground bg-muted";
  }
}

function fmtTime(t?: string) {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DashboardPage({ onSectionChange }: Props) {
  const { activeBookings, buses, loading, refreshData } = useCounter();

  const todayStr = today();
  const monthPrefix = todayStr.substring(0, 7); // YYYY-MM

  const recentBookings = useMemo(
    () => [...activeBookings].slice(0, 8),
    [activeBookings]
  );

  // Today's bookings — exclude cancelled ones so the count reflects real activity
  const todayBuses = useMemo(
    () => activeBookings.filter((b) => b.date === todayStr && b.status !== "cancelled"),
    [activeBookings, todayStr]
  );

  const activeBusesList = useMemo(
    () => buses.filter((b) => b.status === "Active").slice(0, 4),
    [buses]
  );

  // Derive ALL stats live from activeBookings + buses. The realtime listener
  // keeps activeBookings fresh, so the dashboard reflects new bookings the
  // instant they're written — no manual refresh needed, no stale snapshot.
  const stats = useMemo(() => {
    const valid = activeBookings.filter((b) => b.status !== "cancelled");
    const todayList = valid.filter((b) => b.date === todayStr);
    const monthList = valid.filter((b) => b.date?.startsWith(monthPrefix));
    return {
      todayBookings: todayList.length,
      pendingDepartures: todayList.filter((b) => b.status === "booked").length,
      todayRevenue: todayList.reduce((s, b) => s + (b.amount || 0), 0),
      monthlyRevenue: monthList.reduce((s, b) => s + (b.amount || 0), 0),
      totalBuses: buses.length,
      activeBuses: buses.filter((b) => b.status === "Active").length,
    };
  }, [activeBookings, buses, todayStr, monthPrefix]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Good morning</h2>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        <button
          onClick={refreshData}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Today's Bookings"
          value={stats.todayBookings}
          sub={`${stats.pendingDepartures} pending`}
          icon={Ticket}
          accent="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Today's Revenue"
          value={`NPR ${stats.todayRevenue.toLocaleString()}`}
          sub="Confirmed bookings"
          icon={TrendingUp}
          accent="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400"
        />
        <StatCard
          label="Active Buses"
          value={`${stats.activeBuses}/${stats.totalBuses}`}
          sub="In service"
          icon={Bus}
          accent="bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400"
        />
        <StatCard
          label="Monthly Revenue"
          value={`NPR ${stats.monthlyRevenue.toLocaleString()}`}
          sub={new Date().toLocaleDateString("en-US", { month: "long" })}
          icon={TrendingUp}
          accent="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent bookings */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Recent Bookings</h3>
            <button
              onClick={() => onSectionChange("bookings")}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No bookings yet</div>
          ) : (
            <div className="divide-y divide-border">
              {recentBookings.map((b) => {
                const seats = b.seatNumbers?.join(", ") || b.seatNumber || "—";
                return (
                  <div key={b.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Users className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{b.passengerName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {b.busName} · {b.from} → {b.to} · Seat {seats}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusColor(b.status)}`}>
                        {b.status}
                      </span>
                      <p className="text-xs text-muted-foreground mt-0.5">NPR {b.amount?.toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Today's trips */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="font-semibold text-sm text-foreground">Today's Trips</h3>
              <span className="text-xs text-muted-foreground">{todayBuses.length} bookings</span>
            </div>
            {activeBusesList.length === 0 ? (
              <div className="p-5 text-center text-muted-foreground text-xs">No buses active</div>
            ) : (
              <div className="divide-y divide-border">
                {activeBusesList.map((bus) => {
                  const todayCount = todayBuses.filter((b) => b.busId === bus.id).length;
                  const fillPct = Math.min(100, Math.round((todayCount / (bus.seatCapacity || 1)) * 100));
                  return (
                    <div key={bus.id} className="px-5 py-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-xs font-semibold text-foreground truncate">{bus.name}</p>
                        <span className="text-[10px] text-muted-foreground">{todayCount}/{bus.seatCapacity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${fillPct}%` }}
                          />
                        </div>
                        <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="text-[10px] text-muted-foreground">{fmtTime(bus.departureTime)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick actions */}
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm text-foreground mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: "Book a Ticket", section: "book-ticket" as ActiveSection, icon: Ticket, color: "text-blue-600" },
                { label: "Manage Buses", section: "buses" as ActiveSection, icon: Bus, color: "text-orange-600" },
                { label: "View All Bookings", section: "bookings" as ActiveSection, icon: BookOpen, color: "text-green-600" },
              ].map((a) => (
                <button
                  key={a.section}
                  onClick={() => onSectionChange(a.section)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors text-left group"
                >
                  <a.icon className={`w-4 h-4 shrink-0 ${a.color}`} />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">{a.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/50 ml-auto group-hover:text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
