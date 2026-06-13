// lib/compliance/kyc.service.ts
//
// Operator KYC operations (Sprint 2). Client-SDK service, same style as
// components/operator/counter/services/bus.service.ts.
//
// - Operator side: upload a typed document to Storage + write its metadata.
// - Admin side: review queue + approve/reject, which also denormalises the
//   operator's KYC status onto their bus docs (so user search can gate without
//   a join), writes an audit record, and queues an approve/reject email via the
//   Firebase "Trigger Email" extension (the `mail` collection).

import {
  collection,
  doc as docRef,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { firestore, storage } from "@/lib/firebase"
import type { KycStatus, AccountStatus } from "@/contexts/operator-auth-context"
import type { ComplianceDocType, ComplianceDocument } from "./types"

/** An operator row for the admin KYC review page (metadata only; docs lazy-loaded). */
export interface OperatorRow {
  uid: string
  companyName?: string
  name?: string
  email?: string
  contactNumber?: string
  phoneNumber?: string
  address?: string
  description?: string
  licenseNumber?: string
  panNumber?: string
  kycStatus?: KycStatus
  kycRejectionReason?: string
  kycReviewedAt?: Timestamp
  kycReviewedBy?: string
  accountStatus?: AccountStatus
  createdAt?: Timestamp
}

/** An admin audit-log entry (KYC + account actions). */
export interface AuditLogEntry {
  id: string
  adminEmail?: string
  operatorUid?: string
  action?: string
  reason?: string | null
  timestamp?: Timestamp
}

export class KycService {
  private kycDocsCol(uid: string) {
    return collection(firestore, "operators", uid, "kycDocs")
  }

  /**
   * Upload one KYC document for an operator. Stores the file in Storage at
   * kyc/{uid}/{type}_{ts}.{ext}, then writes its metadata keyed by `type` (so
   * re-uploading a type replaces the current document).
   */
  async uploadKycDoc(
    uid: string,
    type: ComplianceDocType,
    file: File,
    expiresAt?: Date | null
  ): Promise<ComplianceDocument> {
    const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : ""
    const storagePath = `kyc/${uid}/${type}_${Date.now()}${ext}`

    const sRef = storageRef(storage, storagePath)
    await uploadBytes(sRef, file, { contentType: file.type })
    const downloadURL = await getDownloadURL(sRef)

    const document: ComplianceDocument = {
      type,
      storagePath,
      downloadURL,
      fileName: file.name,
      contentType: file.type,
      expiresAt: expiresAt ? Timestamp.fromDate(expiresAt) : null,
      verificationStatus: "pending_verification",
      uploadedAt: serverTimestamp() as unknown as Timestamp,
    }

    await setDoc(docRef(firestore, "operators", uid, "kycDocs", type), document)
    return document
  }

  /** All KYC documents an operator has uploaded. */
  async listKycDocs(uid: string): Promise<ComplianceDocument[]> {
    const snap = await getDocs(this.kycDocsCol(uid))
    return snap.docs.map((d) => d.data() as ComplianceDocument)
  }

  // ─── Admin ────────────────────────────────────────────────────────────────

  /** Operators awaiting review, oldest first (metadata only; docs lazy-loaded). */
  async getPendingOperators(): Promise<OperatorRow[]> {
    const q = query(
      collection(firestore, "operators"),
      where("kycStatus", "==", "pending_verification"),
      orderBy("createdAt", "asc")
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ ...(d.data() as Omit<OperatorRow, "uid">), uid: d.id }))
  }

  /** All operators (admin review page). Docs are loaded per-operator via listKycDocs. */
  async getAllOperators(): Promise<OperatorRow[]> {
    const snap = await getDocs(collection(firestore, "operators"))
    return snap.docs.map((d) => ({ ...(d.data() as Omit<OperatorRow, "uid">), uid: d.id }))
  }

  /** Approve an operator's KYC. Flips status, denormalises onto buses, audits, emails. */
  async approveOperator(adminEmail: string, uid: string): Promise<void> {
    await this.reviewOperator(adminEmail, uid, "approved")
  }

  /** Reject an operator's KYC with a reason. */
  async rejectOperator(adminEmail: string, uid: string, reason: string): Promise<void> {
    await this.reviewOperator(adminEmail, uid, "rejected", reason)
  }

  /**
   * Shared approve/reject path. In one batched write:
   *  1. update the operator's kycStatus + review metadata
   *  2. denormalise operatorKycStatus onto every bus the operator owns
   *  3. write an admin audit record
   *  4. queue an email to the operator (Trigger Email extension reads `mail`)
   */
  private async reviewOperator(
    adminEmail: string,
    uid: string,
    decision: Extract<KycStatus, "approved" | "rejected">,
    reason?: string
  ): Promise<void> {
    const opRef = docRef(firestore, "operators", uid)
    const opSnap = await getDoc(opRef)
    if (!opSnap.exists()) throw new Error("Operator not found")
    const op = opSnap.data() as { email?: string; companyName?: string; name?: string }

    const batch = writeBatch(firestore)

    // 1. Operator status.
    batch.update(opRef, {
      kycStatus: decision,
      kycReviewedAt: serverTimestamp(),
      kycReviewedBy: adminEmail,
      // Clear any stale rejection reason on approve; set it on reject.
      kycRejectionReason: decision === "rejected" ? reason ?? "" : "",
      updatedAt: serverTimestamp(),
    })

    // 2. Denormalise onto buses so user search can gate without a join.
    const busesSnap = await getDocs(
      query(collection(firestore, "buses"), where("operatorId", "==", uid))
    )
    busesSnap.docs.forEach((b) => {
      batch.update(b.ref, { operatorKycStatus: decision, updatedAt: serverTimestamp() })
    })

    // 3. Audit record (write-only; no UI this sprint).
    batch.set(docRef(collection(firestore, "adminAuditLog")), {
      adminEmail,
      operatorUid: uid,
      action: `kyc_${decision}`,
      reason: reason ?? null,
      timestamp: serverTimestamp(),
    })

    // 4. Email via Trigger Email extension.
    const to = op.email
    if (to) {
      batch.set(docRef(collection(firestore, "mail")), buildKycMail(to, op.companyName || op.name || "there", decision, reason))
    }

    await batch.commit()
  }

  /** Suspend an operator account. Blocks their login and hides their buses from search. */
  async suspendOperator(adminEmail: string, uid: string): Promise<void> {
    await this.setAccountStatus(adminEmail, uid, "suspended")
  }

  /** Re-activate a suspended operator. Restores login + search visibility. */
  async reactivateOperator(adminEmail: string, uid: string): Promise<void> {
    await this.setAccountStatus(adminEmail, uid, "active")
  }

  /**
   * Flip an operator's account status. In one batch: update the operator,
   * denormalise operatorActive onto their buses (so user search can gate
   * without a join), and write an audit record.
   */
  private async setAccountStatus(adminEmail: string, uid: string, status: AccountStatus): Promise<void> {
    const opRef = docRef(firestore, "operators", uid)
    const batch = writeBatch(firestore)

    batch.update(opRef, { accountStatus: status, updatedAt: serverTimestamp() })

    const isActive = status === "active"
    const busesSnap = await getDocs(
      query(collection(firestore, "buses"), where("operatorId", "==", uid))
    )
    busesSnap.docs.forEach((b) => {
      batch.update(b.ref, { operatorActive: isActive, updatedAt: serverTimestamp() })
    })

    batch.set(docRef(collection(firestore, "adminAuditLog")), {
      adminEmail,
      operatorUid: uid,
      action: status === "suspended" ? "account_suspended" : "account_reactivated",
      reason: null,
      timestamp: serverTimestamp(),
    })

    await batch.commit()
  }

  /** Read the admin audit log, newest first. Capped to a recent window. */
  async getAuditLog(max = 200): Promise<AuditLogEntry[]> {
    const q = query(
      collection(firestore, "adminAuditLog"),
      orderBy("timestamp", "desc"),
      limit(max)
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ ...(d.data() as Omit<AuditLogEntry, "id">), id: d.id }))
  }
}

/** Build the `mail` document the Trigger Email extension sends. */
function buildKycMail(
  to: string,
  name: string,
  decision: "approved" | "rejected",
  reason?: string
) {
  if (decision === "approved") {
    return {
      to: [to],
      message: {
        subject: "Your UthBus operator account is verified ✅",
        text: `Hi ${name},\n\nGood news — your UthBus operator account has been verified. Your approved buses will now appear in traveler search with a Verified Operator badge.\n\n— Team UthBus`,
        html: `<p>Hi ${name},</p><p>Good news — your UthBus operator account has been <b>verified</b>. Your approved buses will now appear in traveler search with a <b>Verified Operator</b> badge.</p><p>— Team UthBus</p>`,
      },
    }
  }
  return {
    to: [to],
    message: {
      subject: "Action needed: your UthBus verification",
      text: `Hi ${name},\n\nWe couldn't verify your operator account yet.\n\nReason: ${reason || "Not specified"}\n\nPlease sign in and re-upload the corrected documents from your dashboard.\n\n— Team UthBus`,
      html: `<p>Hi ${name},</p><p>We couldn't verify your operator account yet.</p><p><b>Reason:</b> ${reason || "Not specified"}</p><p>Please sign in and re-upload the corrected documents from your dashboard.</p><p>— Team UthBus</p>`,
    },
  }
}

export const kycService = new KycService()
