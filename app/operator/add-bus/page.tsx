import { Suspense } from "react"
import AddBusForm from "@/components/operator/add-bus-form"

export default function AddBusPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddBusForm />
    </Suspense>
  )
}
