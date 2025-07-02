import { Suspense } from "react"
import CounterPortal from "@/components/operator/counter/counter-portal"

export default function CounterPortalPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CounterPortal />
    </Suspense>
  )
}
