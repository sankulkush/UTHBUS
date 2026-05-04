// app/operator/layout.tsx
// No extra provider needed here — OperatorAuthProvider is already in app/layout.tsx.
import { Toaster } from "@/components/ui/toaster"

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
