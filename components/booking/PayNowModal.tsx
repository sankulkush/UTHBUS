"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { IActiveBooking } from "@/components/operator/counter/services/active-booking.service"
import { Wallet, CreditCard, Banknote, Info, QrCode } from "lucide-react"

// Sprint 1 stub. UI shape of the future Sprint 3 (Fonepay) and post-MVP (Khalti,
// Card) integrations. Today the gateway options are visibly disabled so the
// user understands they're coming, and the existing "Pay at counter" fallback
// is surfaced as an explicit confirmed-state explanation rather than a button
// that does anything (the booking already IS reserved-pay-at-counter).
//
// To wire up Fonepay later: replace its disabled <button> with a handler that
// calls the QR-generate route, renders the returned Fonepay QR, and resolves
// payment via the status-check API (see USR-PAY / Sprint 3 in the tracker).

type Gateway = {
  id: "fonepay" | "khalti" | "card"
  label: string
  description: string
  badge: string
}

const GATEWAYS: Gateway[] = [
  {
    id: "fonepay",
    label: "Fonepay",
    description: "Scan the QR with any mobile-banking or wallet app",
    badge: "Coming Sprint 3",
  },
  {
    id: "khalti",
    label: "Khalti",
    description: "Pay from your Khalti wallet",
    badge: "Post-MVP",
  },
  {
    id: "card",
    label: "Card (Visa / Mastercard)",
    description: "International or domestic debit/credit card",
    badge: "Post-MVP",
  },
]

export function PayNowModal({
  isOpen,
  onClose,
  booking,
}: {
  isOpen: boolean
  onClose: () => void
  booking: IActiveBooking
}) {
  const amount = booking.amount.toLocaleString()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete payment</DialogTitle>
          <DialogDescription>
            NPR {amount} for {booking.busName} · {booking.from} → {booking.to} · {booking.date}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 pt-1">
          {GATEWAYS.map((gw) => (
            <button
              key={gw.id}
              type="button"
              disabled
              className="w-full flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30 text-left opacity-60 cursor-not-allowed"
              title="Online payments are wired in Sprint 3"
            >
              <div className="w-9 h-9 rounded-md bg-background border border-border flex items-center justify-center shrink-0">
                {gw.id === "card" ? (
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                ) : gw.id === "fonepay" ? (
                  <QrCode className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Wallet className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">{gw.label}</p>
                <p className="text-xs text-muted-foreground">{gw.description}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-[10px] font-semibold">
                {gw.badge}
              </Badge>
            </button>
          ))}
        </div>

        {/* Pay at counter — current default. Not a button because no action is
            needed; the booking is already reserved-pay-at-counter. */}
        <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 p-3">
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Banknote className="w-4 h-4 text-amber-700 dark:text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Pay at the counter (current option)
              </p>
              <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-1 leading-relaxed">
                Your seat is already reserved. Bring{" "}
                <span className="font-bold">NPR {amount}</span> in cash to the
                boarding point on travel day. No further action is needed today.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 text-xs text-muted-foreground pt-2">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <p>
            Online payment becomes available once we integrate Fonepay
            (Sprint 3). Until then, pay-at-counter is the only path — your seat
            is held either way.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
