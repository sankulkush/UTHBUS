// lib/storage/bus-photos.ts
//
// Bus listing photo storage. Photos live under bus-photos/{operatorId}/* (see
// storage.rules — public read, owner write). We namespace by operator uid
// rather than bus id so photos can be uploaded during the "add bus" flow,
// before the bus document (and its id) exists.

import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { storage } from "@/lib/firebase"

export const MAX_BUS_PHOTO_BYTES = 500 * 1024 // 500KB
export const MAX_BUS_PHOTOS = 5

/** Validate a candidate bus photo. Returns an error string or null. Images only. */
export function validateBusPhoto(file: File): string | null {
  if (!file.type.startsWith("image/")) return "Photo must be an image."
  if (file.size > MAX_BUS_PHOTO_BYTES) return "Photo must be 500KB or smaller."
  return null
}

export interface UploadedBusPhoto {
  url: string
  path: string
}

/** Upload one bus photo for an operator and return its download URL + storage path. */
export async function uploadBusPhoto(operatorId: string, file: File): Promise<UploadedBusPhoto> {
  const ext = file.name.includes(".") ? `.${file.name.split(".").pop()}` : ""
  const path = `bus-photos/${operatorId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
  const sRef = storageRef(storage, path)
  await uploadBytes(sRef, file, { contentType: file.type })
  const url = await getDownloadURL(sRef)
  return { url, path }
}

/** Best-effort delete of a previously-uploaded photo. Never throws. */
export async function deleteBusPhoto(path: string): Promise<void> {
  try {
    await deleteObject(storageRef(storage, path))
  } catch {
    /* already gone / permission — non-fatal */
  }
}
