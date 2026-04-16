"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export default function SearchCTA({ from, to }: { from: string; to: string }) {
  const today = new Date().toISOString().split("T")[0]
  const href = `/search?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${today}`

  return (
    <Button asChild size="lg" className="font-semibold px-8 h-11">
      <Link href={href}>
        <Search className="w-4 h-4 mr-2 shrink-0" />
        Search Available Buses
      </Link>
    </Button>
  )
}
