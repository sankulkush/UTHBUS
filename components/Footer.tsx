"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone, Mail } from "lucide-react"
import { useUserAuth } from "@/contexts/user-auth-context"
import { useOperatorAuth } from "@/contexts/operator-auth-context"

export default function Footer() {
  const pathname = usePathname()
  const { userProfile } = useUserAuth()
  const { operator } = useOperatorAuth()

  // Hide on operator and admin portals
  if (pathname?.startsWith("/operator") || pathname?.startsWith("/admin")) return null
  // Hide on booking flow pages
  if (pathname?.startsWith("/booking")) return null

  const isUserLoggedIn = !!userProfile
  const isOperatorLoggedIn = !!operator

  return (
    <footer className="bg-slate-950 text-slate-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="text-xl font-extrabold mb-4 tracking-tight">
              <span className="text-blue-400">uth</span>
              <span className="text-primary">bus</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Nepal&apos;s trusted bus booking platform. Travel safely and comfortably across the country.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
              Quick Links
            </h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              <li><Link href="/about" className="hover:text-slate-100 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-slate-100 transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-slate-100 transition-colors">Help</a></li>
              <li><a href="#" className="hover:text-slate-100 transition-colors">Terms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
              Popular Routes
            </h4>
            <ul className="space-y-2 text-slate-400 text-sm">
              {[
                { label: "Kathmandu – Pokhara",    href: "/kathmandu-to-pokhara-bus" },
                { label: "Kathmandu – Itahari",    href: "/kathmandu-to-itahari-bus" },
                { label: "Kathmandu – Dharan",     href: "/kathmandu-to-dharan-bus" },
                { label: "Kathmandu – Damak",      href: "/kathmandu-to-damak-bus" },
                { label: "Biratnagar – Kathmandu", href: "/biratnagar-to-kathmandu-bus" },
              ].map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="hover:text-slate-100 transition-colors">{r.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {!isUserLoggedIn && !isOperatorLoggedIn && (
            <div>
              <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
                Operator Portal
              </h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/operator/login" className="hover:text-slate-100 transition-colors">Operator Login</Link></li>
                <li><Link href="/operator/register" className="hover:text-slate-100 transition-colors">Register as Operator</Link></li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-4 text-[11px] uppercase tracking-widest text-slate-600">
              Contact
            </h4>
            <div className="space-y-2 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>9810511415</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>uthbus@yahoo.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-600 text-sm">
          <p>&copy; 2025 UthBus. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
