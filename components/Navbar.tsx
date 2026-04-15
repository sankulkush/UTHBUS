// components/Navbar.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/user-auth-context";
import { useOperatorAuth } from "@/contexts/operator-auth-context";
import UserLoginModal from "@/components/auth/UserLoginModal";
import UserSignupModal from "@/components/auth/UserSignupModal";
import ProfileDropdown from "@/components/auth/ProfileDropdown";
import OperatorProfileDropdown from "@/components/auth/OperatorProfileDropdown";
import { Sun, Moon, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const pathname = usePathname();
  const { userProfile } = useUserAuth();
  const { operator } = useOperatorAuth();
  const { theme, setTheme } = useTheme();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            ? "bg-white/90 dark:bg-[#070c1a]/90 backdrop-blur-md shadow-soft border-b border-border/60"
            : "bg-white/70 dark:bg-[#070c1a]/60 backdrop-blur-sm border-b border-transparent"
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
                  {/* Mobile: single login icon */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground"
                    onClick={() => setShowLoginModal(true)}
                    aria-label="Log in"
                  >
                    <LogIn className="h-4 w-4" />
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
