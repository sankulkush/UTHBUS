import { Suspense } from "react"
import Homepage from "@/components/homepage"

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Homepage />
    </Suspense>
  )
}
