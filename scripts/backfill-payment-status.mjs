// One-off migration: backfill paymentStatus / paymentMode / paymentTxnId /
// paidAt on every existing activeBooking that pre-dates the Sprint 1 payment
// model. Pre-Sprint-1 bookings have no concept of payment state, so we
// default them to "unpaid_pending_counter" (the safe assumption — the user
// either paid in cash at the counter, or the booking was never paid for).
//
// Run with: node --env-file=.env.preview scripts/backfill-payment-status.mjs
// Then:     node --env-file=.env.production scripts/backfill-payment-status.mjs
//
// Safe to re-run — docs that already have paymentStatus are skipped, never
// overwritten. Idempotent.

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId   = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey      = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawKey) {
  console.error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.");
  console.error("Run with: node --env-file=.env.preview scripts/backfill-payment-status.mjs");
  process.exit(1);
}

const privateKey = rawKey.replace(/\\n/g, "\n");

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

console.log(`→ Connected to project: ${projectId}`);

const snap = await db.collection("activeBookings").get();
console.log(`→ Found ${snap.size} activeBookings to scan`);

let updated = 0;
let skipped = 0;
let errors  = 0;

for (const doc of snap.docs) {
  const data = doc.data();
  // Already migrated? Leave it alone.
  if (typeof data.paymentStatus === "string") {
    skipped++;
    continue;
  }

  try {
    await doc.ref.update({
      paymentStatus: "unpaid_pending_counter",
      paymentMode:   null,
      paymentTxnId:  null,
      paidAt:        null,
      // Don't touch updatedAt — that's a "user-visible change" timestamp and
      // a backfill isn't one. updatedAt stays whatever it was.
    });
    updated++;
  } catch (e) {
    errors++;
    console.warn(`  ⚠ booking ${doc.id} update failed: ${e.message || e}`);
  }
}

console.log("");
console.log(`✓ Done. Updated ${updated}, skipped ${skipped} (already migrated), errors ${errors}.`);
process.exit(errors > 0 ? 1 : 0);
