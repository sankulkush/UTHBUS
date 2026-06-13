"use client"

import { useRef } from "react"
import { Label } from "@/components/ui/label"
import { Upload, FileCheck2, AlertCircle } from "lucide-react"
import {
  ACCEPTED_KYC_FILE_TYPES,
  validateComplianceFile,
  type ComplianceDocType,
} from "@/lib/compliance/types"

interface KycDocInputProps {
  type: ComplianceDocType
  label: string
  value: File | null
  onChange: (file: File | null) => void
  disabled?: boolean
  required?: boolean
}

/**
 * A single labelled KYC document picker. Validates type/size on selection
 * (same rule as storage.rules) and surfaces a friendly error. Reused by the
 * registration form and the dashboard re-upload flow.
 */
export function KycDocInput({ type, label, value, onChange, disabled, required }: KycDocInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const error = value ? validateComplianceFile(value) : null

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`kyc-${type}`}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className={`w-full flex items-center gap-3 rounded-lg border border-dashed px-3 py-2.5 text-left text-sm transition-colors disabled:opacity-50 ${
          error
            ? "border-destructive/50 bg-destructive/5"
            : value
              ? "border-emerald-500/50 bg-emerald-500/5"
              : "border-border bg-card hover:bg-muted"
        }`}
      >
        {error ? (
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
        ) : value ? (
          <FileCheck2 className="w-4 h-4 shrink-0 text-emerald-600" />
        ) : (
          <Upload className="w-4 h-4 shrink-0 text-muted-foreground" />
        )}
        <span className={`truncate ${value ? "text-foreground" : "text-muted-foreground"}`}>
          {value ? value.name : "Choose a PDF or image (max 300KB)"}
        </span>
      </button>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        id={`kyc-${type}`}
        type="file"
        accept={ACCEPTED_KYC_FILE_TYPES}
        className="hidden"
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </div>
  )
}
