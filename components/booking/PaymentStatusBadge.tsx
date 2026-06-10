"use client"

import type { PaymentStatus } from "@/components/operator/counter/services/active-booking.service"

// Small label-style pill, designed to sit next to the existing booking status
// badge (booked/cancelled/completed) in booking list views — admin, operator,
// and user-side. Pre-Sprint-1 bookings without a paymentStatus field fall back
// to "Pay at counter" (the safe assumption).
const STYLES: Record<PaymentStatus, { label: string; cls: string }> = {
  paid: {
    label: "Paid",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  },
  unpaid_pending_counter: {
    label: "Pay at counter",
    cls: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200",
  },
  pending_gateway: {
    label: "Pending payment",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
  },
  failed: {
    label: "Payment failed",
    cls: "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300",
  },
  refunded: {
    label: "Refunded",
    cls: "bg-muted text-muted-foreground",
  },
}

export function PaymentStatusBadge({
  status,
  className = "",
}: {
  status: PaymentStatus | undefined | null
  className?: string
}) {
  const effective: PaymentStatus = status ?? "unpaid_pending_counter"
  const { label, cls } = STYLES[effective] ?? STYLES.unpaid_pending_counter
  // Dimensions intentionally match shadcn's Badge component
  // (px-2.5 py-0.5 text-xs rounded-full border) so this pill lines up
  // visually next to the existing status badges instead of looking like
  // a different species.
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border border-transparent text-xs font-semibold whitespace-nowrap ${cls} ${className}`}
    >
      {label}
    </span>
  )
}
