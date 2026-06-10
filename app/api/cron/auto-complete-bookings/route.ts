// app/api/cron/auto-complete-bookings/route.ts
//
// Sprint 1 cron: nightly sweep that flips bookings whose travel date has
// passed from status="booked" to status="completed". Runs unconditionally
// from Vercel Cron so completion doesn't depend on a user opening the app.
// Idempotent — safe to invoke any number of times.
//
// Scheduled in vercel.json. Authentication is a Bearer token check against
// CRON_SECRET so randos can't trigger it.

import { NextRequest, NextResponse } from "next/server"
import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

export const dynamic = "force-dynamic"

function ensureAdminInitialized() {
  if (getApps().length) return
  const projectId = process.env.FIREBASE_PROJECT_ID
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
  const rawKey = process.env.FIREBASE_PRIVATE_KEY
  if (!projectId || !clientEmail || !rawKey) {
    throw new Error("Missing Firebase service-account env vars")
  }
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: rawKey.replace(/\\n/g, "\n"),
    }),
  })
}

function todayKathmanduISO(): string {
  // Booking `date` is stored as "YYYY-MM-DD" relative to Asia/Kathmandu.
  // en-CA happens to format exactly that way.
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kathmandu" })
}

export async function GET(req: NextRequest) {
  // Vercel cron requests inject Authorization: Bearer <CRON_SECRET>.
  // Same check works for manual `curl` testing.
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "CRON_SECRET not configured on this deploy" },
      { status: 500 }
    )
  }
  const auth = req.headers.get("authorization") || ""
  if (auth !== `Bearer ${expected}`) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  try {
    ensureAdminInitialized()
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }

  const db = getFirestore()
  const today = todayKathmanduISO()

  // status == "booked" AND date < today. Firestore allows one inequality
  // per query; date is the inequality. Needs the (status ASC, date ASC)
  // composite index declared in firestore.indexes.json.
  const snap = await db
    .collection("activeBookings")
    .where("status", "==", "booked")
    .where("date", "<", today)
    .get()

  if (snap.empty) {
    return NextResponse.json({ ok: true, updated: 0, asOf: today })
  }

  // Firestore batched writes cap at 500 ops. Chunk to be safe.
  const docs = snap.docs
  let updated = 0
  const BATCH_SIZE = 400
  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch()
    const slice = docs.slice(i, i + BATCH_SIZE)
    for (const doc of slice) {
      batch.update(doc.ref, {
        status: "completed",
        updatedAt: new Date(),
      })
    }
    await batch.commit()
    updated += slice.length
  }

  return NextResponse.json({ ok: true, updated, asOf: today })
}
