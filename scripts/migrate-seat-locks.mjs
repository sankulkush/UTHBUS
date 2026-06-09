// One-off migration: backfill seatLocks/{busId_date_seatNumber} for every
// existing activeBooking with status="booked", so the new seat-availability
// check (which reads seatLocks) sees pre-existing reservations.
//
// Run with: node --env-file=.env.preview scripts/migrate-seat-locks.mjs
// Then:     node --env-file=.env.production scripts/migrate-seat-locks.mjs
//
// Safe to re-run — existing seatLocks are skipped, never overwritten.

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const projectId  = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey     = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawKey) {
  console.error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.");
  console.error("Run with: node --env-file=.env.preview scripts/migrate-seat-locks.mjs");
  process.exit(1);
}

const privateKey = rawKey.replace(/\\n/g, "\n");

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

console.log(`→ Connected to project: ${projectId}`);

const snap = await db
  .collection("activeBookings")
  .where("status", "==", "booked")
  .get();

console.log(`→ Found ${snap.size} booked activeBookings to scan`);

let created = 0;
let skipped = 0;
let malformed = 0;

for (const doc of snap.docs) {
  const data = doc.data();
  const { busId, date, seatNumbers, seatNumber, operatorId, userId } = data;
  if (!busId || !date || !operatorId) {
    console.warn(`  ⚠ booking ${doc.id} missing busId/date/operatorId — skipping`);
    malformed++;
    continue;
  }
  const seats = Array.isArray(seatNumbers) && seatNumbers.length
    ? seatNumbers
    : (seatNumber ? [seatNumber] : []);
  if (!seats.length) {
    console.warn(`  ⚠ booking ${doc.id} has no seats — skipping`);
    malformed++;
    continue;
  }

  for (const seat of seats) {
    const lockId = `${busId}_${date}_${seat}`;
    const lockRef = db.collection("seatLocks").doc(lockId);
    const existing = await lockRef.get();
    if (existing.exists) {
      skipped++;
      continue;
    }
    await lockRef.set({
      busId,
      date,
      seatNumber: seat,
      bookingId: doc.id,
      bookerUid: userId || null,
      operatorId,
      createdAt: FieldValue.serverTimestamp(),
    });
    created++;
  }
}

console.log("");
console.log(`✓ Done. Created ${created}, skipped ${skipped} (already existed), malformed ${malformed}.`);
process.exit(0);
