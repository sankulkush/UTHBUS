"use client"

import * as Sentry from "@sentry/nextjs"
import { useState } from "react"

export default function SentryTestPage() {
  const [serverState, setServerState] = useState<string>("")

  if (process.env.NEXT_PUBLIC_ENV === "production") {
    return (
      <main className="mx-auto max-w-xl p-10">
        <h1 className="text-xl font-bold">Sentry test disabled in production</h1>
        <p className="mt-2 text-sm text-gray-600">
          Run this on preview (dev.uthbus.com) or localhost only.
        </p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-xl p-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sentry smoke test</h1>
        <p className="mt-2 text-sm text-gray-600">
          Each button sends a deliberate error to Sentry. Check the dashboard
          afterwards — events appear within ~30 seconds.
        </p>
      </div>

      <button
        className="w-full rounded bg-red-600 px-4 py-3 text-white font-semibold"
        onClick={() => {
          throw new Error("Sentry client smoke test — thrown from button click")
        }}
      >
        Throw client-side error
      </button>

      <button
        className="w-full rounded bg-blue-600 px-4 py-3 text-white font-semibold"
        onClick={() => {
          Sentry.captureMessage("Sentry client smoke test — captureMessage", "info")
          alert("Message sent to Sentry. Check dashboard.")
        }}
      >
        Send captureMessage (non-error)
      </button>

      <button
        className="w-full rounded bg-purple-600 px-4 py-3 text-white font-semibold"
        onClick={async () => {
          const res = await fetch("/api/sentry-test")
          const text = await res.text()
          setServerState(text)
        }}
      >
        Trigger server-side error
      </button>

      {serverState && (
        <pre className="rounded bg-gray-100 p-3 text-xs">{serverState}</pre>
      )}
    </main>
  )
}
