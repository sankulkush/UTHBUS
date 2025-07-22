'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import ProfileDropdown from './ProfileDropdown';

const AuthWrapper: React.FC = () => {
  const { user, loading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const handleSwitchToSignup = () => {
    setShowLoginModal(false);
    setShowSignupModal(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignupModal(false);
    setShowLoginModal(true);
  };

  const closeModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <ProfileDropdown />;
  }

  return (
    <>
      {/* Login/Signup Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowLoginModal(true)}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
        >
          Login
        </button>
        <button
          onClick={() => setShowSignupModal(true)}
          className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </button>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={closeModals}
        onSwitchToSignup={handleSwitchToSignup}
      />
      <SignupModal
        isOpen={showSignupModal}
        onClose={closeModals}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </>
  );
};

export default AuthWrapper;