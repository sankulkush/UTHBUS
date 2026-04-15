// components/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/user-auth-context";
import { useOperatorAuth } from "@/contexts/operator-auth-context";
import UserLoginModal from "@/components/Auth/UserLoginModal";
import UserSignupModal from "@/components/Auth/UserSignupModal";
import ProfileDropdown from "@/components/Auth/ProfileDropdown";
import OperatorProfileDropdown from "@/components/Auth/OperatorProfileDropdown";
import { Sun, Moon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  // All hooks unconditionally at the top
  const pathname = usePathname();
  const { userProfile } = useUserAuth();
  const { operator } = useOperatorAuth();
  const { theme, setTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Never render on operator routes
  if (pathname?.startsWith("/operator")) return null;

  const isUserLoggedIn = !!userProfile;
  const isOperatorLoggedIn = !!operator;
  const isDark = theme === "dark";

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-rose-50/90 dark:bg-[#070c1a]/90 backdrop-blur-md shadow-soft border-b border-border/60"
            : "bg-rose-50/70 dark:bg-[#070c1a]/60 backdrop-blur-sm border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 select-none">
              <span className="text-xl font-extrabold tracking-tight leading-none">
                <span className="text-blue-600 dark:text-blue-400">uth</span>
                <span className="text-primary">bus</span>
              </span>
            </Link>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                    pathname === link.href
                      ? "text-foreground bg-muted"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right side controls */}
            <div className="flex items-center gap-1.5">
              {/* Theme toggle — always visible */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
                className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground"
                aria-label="Toggle theme"
              >
                {mounted ? (
                  isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>

              {/* Account — visible on all sizes when logged in */}
              {isUserLoggedIn && <ProfileDropdown />}
              {isOperatorLoggedIn && <OperatorProfileDropdown />}

              {/* Desktop auth (not logged in) */}
              {!isUserLoggedIn && !isOperatorLoggedIn && (
                <div className="hidden md:flex items-center gap-1.5">
                  <Link href="/operator/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-sm font-medium text-muted-foreground hover:text-foreground"
                    >
                      Operator
                    </Button>
                  </Link>
                  <div className="w-px h-4 bg-border mx-0.5" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Log in
                  </Button>
                  <Button
                    size="sm"
                    className="text-sm font-semibold h-9 px-4 shadow-sm"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Sign up
                  </Button>
                </div>
              )}

              {/* Mobile menu toggle (only when not logged in on mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-9 w-9 rounded-lg"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border/60 bg-rose-50/95 dark:bg-[#070c1a]/95 backdrop-blur-md animate-slide-up">
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors",
                    pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {!isUserLoggedIn && !isOperatorLoggedIn && (
                <div className="pt-2 mt-1 border-t border-border/60 space-y-0.5">
                  <Link
                    href="/operator/login"
                    className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    Operator Portal
                  </Link>
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="w-full flex items-center px-4 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => setShowSignupModal(true)}
                    className="w-full flex items-center justify-center px-4 py-2.5 mt-1 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <UserLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <UserSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </>
  );
}
