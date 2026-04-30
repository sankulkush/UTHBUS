"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Check, Copy, Sparkles, X, ArrowRight, Ticket } from "lucide-react"

interface WelcomePromoModalProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

export default function WelcomePromoModal({ isOpen, onClose, userName }: WelcomePromoModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText("WELCOME50")
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const firstName = userName?.split(" ")[0]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border-0 shadow-2xl gap-0 [&>button]:hidden">

        {/* Gradient hero section */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-primary/85 px-8 pt-8 pb-12 text-center overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white" />
            <div className="absolute -bottom-12 -left-8 w-52 h-52 rounded-full bg-white" />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Icon */}
          <div className="relative w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Title — satisfies Radix DialogTitle requirement */}
          <DialogTitle className="text-2xl font-bold text-white mb-1">
            Welcome{firstName ? `, ${firstName}` : ""}! 🎉
          </DialogTitle>
          <p className="text-white/80 text-sm">Your account is ready. Here's a gift for you.</p>
        </div>

        {/* Content section — lifted over the gradient */}
        <div className="relative -mt-6 bg-background rounded-t-3xl px-6 pt-6 pb-7">

          {/* Offer label */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            <Ticket className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">First Booking Offer</span>
          </div>

          {/* Savings highlight */}
          <div className="text-center mb-5">
            <p className="text-4xl font-black text-foreground">Rs. 50 <span className="text-primary">off</span></p>
            <p className="text-sm text-muted-foreground mt-1">on your very first bus booking</p>
          </div>

          {/* Promo code box */}
          <div className="flex items-stretch gap-2 mb-4">
            <div className="flex-1 bg-muted/60 border-2 border-dashed border-primary/40 rounded-xl px-4 py-3 font-mono font-bold text-foreground text-lg tracking-[0.2em] text-center flex items-center justify-center">
              WELCOME50
            </div>
            <button
              onClick={handleCopy}
              className={`shrink-0 flex items-center gap-2 px-4 rounded-xl text-sm font-semibold transition-all active:scale-95 min-w-[90px] justify-center ${
                copied
                  ? "bg-green-500 text-white"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {copied ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy</>
              )}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground text-center mb-5">
            Apply this code at checkout · Valid on first booking only
          </p>

          {/* CTA */}
          <button
            onClick={onClose}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
          >
            Start Booking
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
