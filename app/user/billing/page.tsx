import { MapPin } from "lucide-react"
import ComingSoon from "@/components/ComingSoon"

export default function BillingPage() {
  return (
    <ComingSoon
      title="Billing Address"
      description="Manage your billing addresses and payment information"
      icon={MapPin}
    />
  )
}