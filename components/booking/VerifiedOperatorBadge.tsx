import { BadgeCheck } from "lucide-react"

interface VerifiedOperatorBadgeProps {
  /** "compact" shows just the tick + "Verified" (search cards); "full" adds "Operator". */
  variant?: "compact" | "full"
  className?: string
}

/**
 * Small green "Verified Operator" badge. Surfaced on search result cards and on
 * the e-ticket once operator KYC ships (Sprint 2). Because user search only
 * returns buses whose operator is approved, this renders unconditionally where
 * placed — it has no status logic of its own.
 */
export function VerifiedOperatorBadge({ variant = "compact", className = "" }: VerifiedOperatorBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-950/40 px-1.5 py-0.5 text-[10px] font-semibold text-green-700 dark:text-green-400 ${className}`}
      title="This operator's company documents have been verified by UthBus"
    >
      <BadgeCheck className="w-3 h-3" />
      {variant === "full" ? "Verified Operator" : "Verified"}
    </span>
  )
}
