// One-off migration: backfill operator KYC state for Sprint 2.
//
// Existing operators predate the KYC gate, so we mark them "approved" (you'll
// re-verify them manually as you onboard — but don't break what's live). We
// also denormalise operatorKycStatus = "approved" onto every existing bus so
// the new user-search gate (which hides buses whose operator isn't approved)
// doesn't make currently-listed buses vanish.
//
// Run with: node --env-file=.env.preview    scripts/backfill-kyc.mjs
// Then:     node --env-file=.env.production scripts/backfill-kyc.mjs
//
// Safe to re-run — operators/buses that already carry the field are skipped,
// never overwritten. Idempotent.

import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId   = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const rawKey      = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !rawKey) {
  console.error("Missing FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY.");
  console.error("Run with: node --env-file=.env.preview scripts/backfill-kyc.mjs");
  process.exit(1);
}

const privateKey = rawKey.replace(/\\n/g, "\n");

initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

const db = getFirestore();

console.log(`→ Connected to project: ${projectId}`);

let updated = 0;
let skipped = 0;
let errors  = 0;

// ── Operators ────────────────────────────────────────────────────────────────
const opsSnap = await db.collection("operators").get();
console.log(`→ Found ${opsSnap.size} operators to scan`);

for (const doc of opsSnap.docs) {
  const data = doc.data();
  if (typeof data.kycStatus === "string") { skipped++; continue; }
  try {
    await doc.ref.update({ kycStatus: "approved" });
    updated++;
  } catch (e) {
    errors++;
    console.warn(`  ⚠ operator ${doc.id} update failed: ${e.message || e}`);
  }
}

// ── Buses (denormalised operatorKycStatus) ─────────────────────────────────────
const busSnap = await db.collection("buses").get();
console.log(`→ Found ${busSnap.size} buses to scan`);

for (const doc of busSnap.docs) {
  const data = doc.data();
  if (typeof data.operatorKycStatus === "string") { skipped++; continue; }
  try {
    await doc.ref.update({ operatorKycStatus: "approved" });
    updated++;
  } catch (e) {
    errors++;
    console.warn(`  ⚠ bus ${doc.id} update failed: ${e.message || e}`);
  }
}

console.log("");
console.log(`✓ Done. Updated ${updated}, skipped ${skipped} (already migrated), errors ${errors}.`);
process.exit(errors > 0 ? 1 : 0);
