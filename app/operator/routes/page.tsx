import { Suspense } from "react"
import ManageRoutes from "@/components/operator/manage-routes"

export default function ManageRoutesPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ManageRoutes />
    </Suspense>
  )
}
