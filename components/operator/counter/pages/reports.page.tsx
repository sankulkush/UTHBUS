"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, Bus, Users, XCircle, Globe } from "lucide-react";
import { useCounter } from "../context/counter-context";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xl font-bold text-foreground leading-tight">{value}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { activeBookings, buses, dashboardStats } = useCounter();
  const today = todayStr();
  const monthStart = today.substring(0, 7);

  const stats = useMemo(() => {
    const todayB = activeBookings.filter((b) => b.date === today);
    const monthB = activeBookings.filter((b) => b.date?.startsWith(monthStart));
    const onlineB = activeBookings.filter((b) => b.userId);
    const cancelledB = activeBookings.filter((b) => b.status === "cancelled");

    // Route breakdown
    const routeMap = new Map<string, { count: number; revenue: number }>();
    activeBookings.filter((b) => b.status !== "cancelled").forEach((b) => {
      const key = `${b.from} → ${b.to}`;
      const existing = routeMap.get(key) ?? { count: 0, revenue: 0 };
      routeMap.set(key, { count: existing.count + 1, revenue: existing.revenue + (b.amount ?? 0) });
    });
    const topRoutes = Array.from(routeMap.entries())
      .map(([route, data]) => ({ route, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Bus breakdown
    const busMap = new Map<string, { name: string; count: number; revenue: number }>();
    activeBookings.filter((b) => b.status !== "cancelled").forEach((b) => {
      const existing = busMap.get(b.busId) ?? { name: b.busName, count: 0, revenue: 0 };
      busMap.set(b.busId, { name: b.busName, count: existing.count + 1, revenue: existing.revenue + (b.amount ?? 0) });
    });
    const topBuses = Array.from(busMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      todayCount: todayB.filter((b) => b.status !== "cancelled").length,
      todayRevenue: todayB.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.amount ?? 0), 0),
      monthCount: monthB.filter((b) => b.status !== "cancelled").length,
      monthRevenue: monthB.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.amount ?? 0), 0),
      totalCount: activeBookings.filter((b) => b.status !== "cancelled").length,
      totalRevenue: activeBookings.filter((b) => b.status !== "cancelled").reduce((s, b) => s + (b.amount ?? 0), 0),
      onlineCount: onlineB.length,
      cancelledCount: cancelledB.length,
      topRoutes,
      topBuses,
    };
  }, [activeBookings, today, monthStart]);

  const maxRouteCount = stats.topRoutes[0]?.count ?? 1;
  const maxBusCount = stats.topBuses[0]?.count ?? 1;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Today's Bookings" value={stats.todayCount}
          sub={`NPR ${stats.todayRevenue.toLocaleString()}`}
          icon={TrendingUp} accent="bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400" />
        <StatCard label="This Month" value={stats.monthCount}
          sub={`NPR ${stats.monthRevenue.toLocaleString()}`}
          icon={BarChart3} accent="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400" />
        <StatCard label="Online Bookings" value={stats.onlineCount}
          sub="via app / website"
          icon={Globe} accent="bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400" />
        <StatCard label="Cancellations" value={stats.cancelledCount}
          sub={`${stats.totalCount > 0 ? Math.round((stats.cancelledCount / (stats.totalCount + stats.cancelledCount)) * 100) : 0}% rate`}
          icon={XCircle} accent="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top routes */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Top Routes</h3>
            <p className="text-xs text-muted-foreground mt-0.5">By booking count (all time)</p>
          </div>
          <div className="p-4 space-y-3">
            {stats.topRoutes.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
            ) : stats.topRoutes.map(({ route, count, revenue }) => (
              <div key={route}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground truncate">{route}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{count} · NPR {revenue.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${(count / maxRouteCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top buses */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold text-sm text-foreground">Bus Performance</h3>
            <p className="text-xs text-muted-foreground mt-0.5">By booking count (all time)</p>
          </div>
          <div className="p-4 space-y-3">
            {stats.topBuses.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">No data yet</p>
            ) : stats.topBuses.map(({ name, count, revenue }) => (
              <div key={name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-foreground truncate">{name}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{count} · NPR {revenue.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${(count / maxBusCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="font-semibold text-sm text-foreground mb-3">All-time Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Total Bookings</p>
            <p className="font-bold text-foreground text-lg">{stats.totalCount}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Total Revenue</p>
            <p className="font-bold text-foreground text-lg">NPR {stats.totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Active Buses</p>
            <p className="font-bold text-foreground text-lg">{buses.filter((b) => b.status === "Active").length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
