// lib/compliance/types.ts
//
// The shared, typed, expiry-aware document model for UthBus compliance.
//
// Sprint 2 (KYC) uses only the company-level document types (companyCert /
// license / pan), stored under operators/{uid}/kycDocs. The per-vehicle types
// (routePermit / insurance / fitness / pollution) are reserved here so the
// later Compliance Vault (OPR-COMPLY) is a pure UI layer on top of this exact
// model — NOT a data migration. Both surfaces read the same ComplianceDocument
// shape; the vault simply adds the per-bus subcollection and the expiry UI.

import type { Timestamp } from "firebase/firestore"

/** Every document type UthBus tracks. Company-level first, per-vehicle second. */
export type ComplianceDocType =
  // Company-level (operators/{uid}/kycDocs) — used by Sprint 2 KYC.
  | "companyCert" // company registration certificate
  | "license" // operator license certificate
  | "pan" // PAN / VAT certificate
  // Per-vehicle (buses/{id}/complianceDocs) — reserved for OPR-COMPLY.
  | "routePermit"
  | "insurance"
  | "fitness" // DoTM fitness certificate
  | "pollution" // emission / pollution certificate

/** The company-level subset that Sprint 2 KYC collects at registration. */
export const KYC_DOC_TYPES: ComplianceDocType[] = ["companyCert", "license", "pan"]

/** Upload limits — kept in sync with storage.rules. */
export const MAX_KYC_FILE_BYTES = 300 * 1024 // 300KB
export const ACCEPTED_KYC_FILE_TYPES = "application/pdf,image/*"

/** Client-side guard mirroring storage.rules. Returns an error string or null. */
export function validateComplianceFile(file: File): string | null {
  if (!/^(application\/pdf|image\/)/.test(file.type)) {
    return "File must be a PDF or an image."
  }
  if (file.size > MAX_KYC_FILE_BYTES) {
    return "File must be 300KB or smaller."
  }
  return null
}

/** Per-document review state, mirrors the operator-level kycStatus values. */
export type DocVerificationStatus = "pending_verification" | "approved" | "rejected"

/** Human-readable labels for each document type (UI). */
export const DOC_TYPE_LABELS: Record<ComplianceDocType, string> = {
  companyCert: "Company Registration Certificate",
  license: "Operator License",
  pan: "PAN / VAT Certificate",
  routePermit: "Route Permit",
  insurance: "Insurance Certificate",
  fitness: "Fitness Certificate (DoTM)",
  pollution: "Pollution / Emission Certificate",
}

/**
 * A single stored compliance document. Persisted as a Firestore doc keyed by
 * its `type` (one current document per type; replacing re-writes the same doc).
 *
 * `downloadURL` is a tokenised Firebase Storage URL resolved at upload time.
 * It is how the admin review UI views the file without needing Storage read
 * rules (see storage.rules). It is stored on metadata that firestore.rules
 * gates to owner + admin.
 */
export interface ComplianceDocument {
  type: ComplianceDocType
  storagePath: string // e.g. "kyc/{uid}/companyCert_1718352000000.pdf"
  downloadURL: string
  fileName: string
  contentType: string
  /** Nullable — company cert / PAN may never expire; permits/insurance do. */
  expiresAt: Timestamp | null
  verificationStatus: DocVerificationStatus
  uploadedAt: Timestamp
  rejectionReason?: string
}

/**
 * Colour state for a document's expiry, per OPR-COMPLY R3. Built in Sprint 2 so
 * the Compliance Vault is pure UI later.
 * - no_expiry:    expiresAt is null (document never expires)
 * - valid:        expires in more than 30 days
 * - expiring_soon: expires within the next 30 days (amber)
 * - expired:      expiry date has passed (red)
 */
export type DocExpiryState = "no_expiry" | "valid" | "expiring_soon" | "expired"

/** Window before expiry at which a document is flagged "expiring soon". */
export const EXPIRY_SOON_DAYS = 30

const MS_PER_DAY = 24 * 60 * 60 * 1000

/**
 * Resolve the expiry colour state for a document.
 * Accepts a Date | null (callers convert Firestore Timestamp via `.toDate()`).
 */
export function getDocExpiryState(expiresAt: Date | null, now: Date = new Date()): DocExpiryState {
  if (!expiresAt) return "no_expiry"
  const msUntil = expiresAt.getTime() - now.getTime()
  if (msUntil < 0) return "expired"
  if (msUntil <= EXPIRY_SOON_DAYS * MS_PER_DAY) return "expiring_soon"
  return "valid"
}
