// components/Navbar.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/user-auth-context";
import { useOperatorAuth } from "@/contexts/operator-auth-context";
import UserLoginModal from "@/components/auth/UserLoginModal";
import UserSignupModal from "@/components/auth/UserSignupModal";
import WelcomePromoModal from "@/components/auth/WelcomePromoModal";
import ProfileDropdown from "@/components/auth/ProfileDropdown";
import OperatorProfileDropdown from "@/components/auth/OperatorProfileDropdown";
import { Sun, Moon, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { user, userProfile } = useUserAuth();
  const { operator } = useOperatorAuth();
  const { theme, setTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showWelcomePromo, setShowWelcomePromo] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevUidRef = useRef<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Show welcome promo only on first-ever sign-up, never on repeat logins
  useEffect(() => {
    if (!user) { prevUidRef.current = null; return; }
    if (prevUidRef.current === user.uid) return; // same session, already checked
    prevUidRef.current = user.uid;

    const storageKey = `uthbus_promo_${user.uid}`;
    if (localStorage.getItem(storageKey)) return; // already shown before

    try {
      const created = new Date(user.metadata.creationTime!).getTime();
      const lastSignIn = new Date(user.metadata.lastSignInTime!).getTime();
      const isNewSignup = Math.abs(lastSignIn - created) < 120_000; // within 2 min
      if (isNewSignup) setShowWelcomePromo(true);
    } catch {
      // metadata unavailable — skip promo
    }
  }, [user]);

  if (pathname?.startsWith("/operator") || pathname?.startsWith("/admin")) return null;

  const isUserLoggedIn = !!userProfile;
  const isOperatorLoggedIn = !!operator;
  const isDark = theme === "dark";

  const handleLoginSuccess = () => {};

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-background/90 backdrop-blur-md shadow-soft border-b border-border/60"
            : "bg-background/70 backdrop-blur-sm border-b border-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 select-none">
              <span className="font-display text-xl font-bold tracking-tight leading-none">
                <span className="text-foreground">uth</span>
                <span className="text-primary">bus</span>
              </span>
            </Link>

            {/* Right controls */}
            <div className="flex items-center gap-1.5">
              {/* Theme toggle */}
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

              {/* Logged in — account dropdown (all screen sizes) */}
              {isUserLoggedIn && <ProfileDropdown />}
              {isOperatorLoggedIn && <OperatorProfileDropdown />}

              {/* Not logged in */}
              {!isUserLoggedIn && !isOperatorLoggedIn && (
                <>
                  {/* Mobile: icon + "Login" text */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => setShowLoginModal(true)}
                  >
                    <LogIn className="h-4 w-4 shrink-0" />
                    <span className="text-sm font-medium">Login</span>
                  </Button>

                  {/* Desktop: text buttons */}
                  <div className="hidden md:flex items-center gap-1.5">
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
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <UserLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
      />
      <UserSignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
      <WelcomePromoModal
        isOpen={showWelcomePromo}
        onClose={() => {
          if (user) localStorage.setItem(`uthbus_promo_${user.uid}`, "1");
          setShowWelcomePromo(false);
        }}
        userName={userProfile?.fullName}
      />
    </>
  );
}
