import { CreditCard } from "lucide-react"
import ComingSoon from "@/components/ComingSoon"

export default function CreditsPage() {
  return (
    <ComingSoon
      title="UthBus Cash"
      description="Manage your wallet balance and transaction history"
      icon={CreditCard}
    />
  )
}