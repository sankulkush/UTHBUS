import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  if (process.env.NEXT_PUBLIC_ENV === "production") {
    return NextResponse.json({ error: "disabled in production" }, { status: 403 })
  }
  throw new Error("Sentry server smoke test — thrown from /api/sentry-test")
}
