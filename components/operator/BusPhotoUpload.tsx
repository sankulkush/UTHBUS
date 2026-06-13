"use client"

import { useRef, useState } from "react"
import { ImagePlus, X, Loader2 } from "lucide-react"
import {
  uploadBusPhoto,
  deleteBusPhoto,
  validateBusPhoto,
  MAX_BUS_PHOTOS,
} from "@/lib/storage/bus-photos"

interface BusPhotoUploadProps {
  operatorId: string
  /** Current photo URLs (the bus's `photos` array). */
  value: string[]
  onChange: (urls: string[]) => void
  disabled?: boolean
}

/**
 * Multi-image uploader for bus listing photos. Uploads each file to Storage on
 * selection and emits the resulting download URLs via onChange. Up to
 * MAX_BUS_PHOTOS, all optional. Removing a photo uploaded in this session also
 * deletes it from Storage; pre-existing photos (edit mode) are just dropped.
 */
export function BusPhotoUpload({ operatorId, value, onChange, disabled }: BusPhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  // Track storage paths for URLs uploaded this session so we can delete them.
  const [pathByUrl, setPathByUrl] = useState<Record<string, string>>({})

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError("")

    const remaining = MAX_BUS_PHOTOS - value.length
    if (remaining <= 0) {
      setError(`You can upload up to ${MAX_BUS_PHOTOS} photos.`)
      return
    }
    const picked = Array.from(files).slice(0, remaining)

    for (const f of picked) {
      const err = validateBusPhoto(f)
      if (err) { setError(err); return }
    }

    setUploading(true)
    try {
      const uploaded = await Promise.all(picked.map((f) => uploadBusPhoto(operatorId, f)))
      const newPaths: Record<string, string> = {}
      uploaded.forEach((u) => { newPaths[u.url] = u.path })
      setPathByUrl((m) => ({ ...m, ...newPaths }))
      onChange([...value, ...uploaded.map((u) => u.url)])
    } catch (e: any) {
      setError(e?.message || "Upload failed. Please try again.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const removeAt = (url: string) => {
    if (pathByUrl[url]) deleteBusPhoto(pathByUrl[url]) // best-effort, fire-and-forget
    onChange(value.filter((u) => u !== url))
  }

  const atLimit = value.length >= MAX_BUS_PHOTOS

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url) => (
          <div key={url} className="relative aspect-video rounded-lg overflow-hidden border border-border bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Bus photo" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(url)}
              disabled={disabled}
              className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              aria-label="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}

        {!atLimit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || uploading}
            className="aspect-video rounded-lg border border-dashed border-border bg-card hover:bg-muted flex flex-col items-center justify-center gap-1 text-muted-foreground disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImagePlus className="w-5 h-5" />}
            <span className="text-[10px]">{uploading ? "Uploading…" : "Add photo"}</span>
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Up to {MAX_BUS_PHOTOS} photos, images only (max 500KB each). Optional — a placeholder is shown if none are added.
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
