"use client"

import { useEffect, useCallback } from "react"
import { createPortal } from "react-dom"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface LightboxProps {
  images: string[]
  /** Index of the open image, or null when closed. */
  index: number | null
  onClose: () => void
  onIndexChange: (i: number) => void
}

/**
 * Fullscreen image viewer. Modern + responsive: dark backdrop, centered image,
 * close (X) top-right, keyboard support (Esc / ← / →), prev-next arrows and
 * dot indicators when there's more than one image. Click the backdrop to close.
 */
export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const isOpen = index !== null && index >= 0 && index < images.length

  const go = useCallback(
    (delta: number) => {
      if (index === null) return
      const next = (index + delta + images.length) % images.length
      onIndexChange(next)
    },
    [index, images.length, onIndexChange]
  )

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowRight") go(1)
      else if (e.key === "ArrowLeft") go(-1)
    }
    window.addEventListener("keydown", onKey)
    // Lock body scroll while open.
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen, go, onClose])

  if (!isOpen || typeof document === "undefined") return null
  const multiple = images.length > 1

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {multiple && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); go(-1) }}
            aria-label="Previous"
            className="absolute left-3 sm:left-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); go(1) }}
            aria-label="Next"
            className="absolute right-3 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={images[index!]}
        alt=""
        onClick={(e) => e.stopPropagation()}
        className="max-w-[92vw] max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
      />

      {/* Dots */}
      {multiple && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onIndexChange(i) }}
              aria-label={`Go to image ${i + 1}`}
              className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-white" : "bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}
