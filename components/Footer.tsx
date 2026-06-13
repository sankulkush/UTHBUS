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
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <div className="text-xl font-extrabold mb-4 tracking-tight">
              <span className="text-blue-600 dark:text-blue-400">uth</span>
              <span className="text-primary">bus</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Book a bus seat anywhere in Nepal in a couple of minutes — no counter queues, no phone calls.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-xs uppercase tracking-wider text-muted-foreground/70">
              Company
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About us</Link></li>
              <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Help</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-4 text-xs uppercase tracking-wider text-muted-foreground/70">
              Popular routes
            </h4>
            <ul className="space-y-2 text-muted-foreground text-sm">
              {[
                { label: "Kathmandu – Pokhara",    href: "/kathmandu-to-pokhara-bus" },
                { label: "Kathmandu – Itahari",    href: "/kathmandu-to-itahari-bus" },
                { label: "Kathmandu – Dharan",     href: "/kathmandu-to-dharan-bus" },
                { label: "Kathmandu – Damak",      href: "/kathmandu-to-damak-bus" },
                { label: "Biratnagar – Kathmandu", href: "/biratnagar-to-kathmandu-bus" },
              ].map((r) => (
                <li key={r.href}>
                  <Link href={r.href} className="hover:text-foreground transition-colors">{r.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {!isUserLoggedIn && !isOperatorLoggedIn && (
            <div>
              <h4 className="font-medium mb-4 text-xs uppercase tracking-wider text-muted-foreground/70">
                For operators
              </h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><Link href="/operator/login" className="hover:text-foreground transition-colors">Operator login</Link></li>
                <li><Link href="/operator/register" className="hover:text-foreground transition-colors">List your buses</Link></li>
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-4 text-xs uppercase tracking-wider text-muted-foreground/70">
              Talk to us
            </h4>
            <div className="space-y-2 text-muted-foreground text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>+977 9810511415</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>uthbus@yahoo.com</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-muted-foreground/70 text-sm">
          <p>&copy; 2026 UthBus. All rights reserved.</p>
          <p>Made in Nepal</p>
        </div>
      </div>
    </footer>
  )
}
