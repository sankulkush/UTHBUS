// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useUserAuth } from "@/contexts/user-auth-context";
import { useOperatorAuth } from "@/contexts/operator-auth-context";
import UserLoginModal from "@/components/Auth/UserLoginModal";
import UserSignupModal from "@/components/Auth/UserSignupModal";
import ProfileDropdown from "@/components/Auth/ProfileDropdown";
import OperatorProfileDropdown from "@/components/Auth/OperatorProfileDropdown";

export default function Navbar() {
  const pathname = usePathname();

  // 1) Never render the Navbar on any /operator/* route
  if (pathname?.startsWith("/operator")) {
    return null;
  }

  const { userProfile } = useUserAuth();
  const { operator }    = useOperatorAuth();
  const [showLoginModal, setShowLoginModal]   = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const isUserLoggedIn     = !!userProfile;
  const isOperatorLoggedIn = !!operator;

  return (
    <>
      <nav className="bg-white shadow-sm border-b fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-blue-600">uth</span>
                <span className="text-red-600">bus</span>
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  href="/"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Contact
                </Link>
              </div>
            </div>

            {/* Auth Buttons / Dropdowns */}
            <div className="flex items-center space-x-4">
              {/* Operator Portal button, only if nobody is signed in */}
              {!isUserLoggedIn && !isOperatorLoggedIn && (
                <Link href="/operator/login">
                  <Button variant="outline" size="sm">
                    Operator Portal
                  </Button>
                </Link>
              )}

              {/* User Login/Signup, only if nobody is signed in */}
              {!isOperatorLoggedIn && !isUserLoggedIn && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowLoginModal(true)}
                  >
                    Login
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowSignupModal(true)}
                  >
                    Sign Up
                  </Button>
                </>
              )}

              {/* If user is signed in, show user dropdown */}
              {isUserLoggedIn && <ProfileDropdown />}

              {/* If operator is signed in (outside /operator routes), show operator dropdown */}
              {isOperatorLoggedIn && <OperatorProfileDropdown />}
            </div>
          </div>
        </div>
      </nav>

      {/* User Auth Modals */}
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
