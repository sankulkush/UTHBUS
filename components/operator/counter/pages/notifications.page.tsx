"use client";

import { Bell, CheckCheck, ExternalLink, Ticket, XCircle, AlertTriangle, Globe, Monitor } from "lucide-react";
import { useCounter } from "../context/counter-context";
import type { INotification } from "../types/counter.types";

function timeAgo(ts: any): string {
  if (!ts) return "";
  try {
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
}

function NotifIcon({ n }: { n: INotification }) {
  if (n.type === "cancellation") return <XCircle className="w-4 h-4 text-red-500" />;
  if (n.type === "seat_warning") return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
  if (n.isOnline) return <Globe className="w-4 h-4 text-purple-500" />;
  return <Monitor className="w-4 h-4 text-blue-500" />;
}

export function NotificationsPage() {
  const { notifications, unreadCount, markNotificationRead, markAllRead } = useCounter();

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Info banner for real-time */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
        <Bell className="w-3.5 h-3.5 mt-0.5 shrink-0" />
        <p>This feed updates in real-time. New online bookings appear instantly — no refresh needed.</p>
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground text-sm">No notifications yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">New bookings will appear here instantly</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors hover:bg-muted/30 ${!n.read ? "bg-primary/5" : ""}`}
            >
              {/* Unread dot */}
              <div className="pt-1 shrink-0">
                {!n.read ? (
                  <div className="w-2 h-2 rounded-full bg-primary" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-transparent" />
                )}
              </div>

              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <NotifIcon n={n} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <p className={`text-sm truncate ${!n.read ? "font-semibold text-foreground" : "font-medium text-muted-foreground"}`}>
                    {n.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                {n.amount && (
                  <p className="text-xs font-semibold text-primary mt-0.5">NPR {n.amount.toLocaleString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
