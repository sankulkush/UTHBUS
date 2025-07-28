// components/Auth/UserAuthWrapper.tsx
'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUserAuth } from '@/contexts/user-auth-context';

interface UserAuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export default function UserAuthWrapper({ 
  children, 
  requireAuth = false, 
  redirectTo = '/' 
}: UserAuthWrapperProps) {
  const { user, loading } = useUserAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Redirect to login or show login modal
        router.push(redirectTo);
      } else if (!requireAuth && user && pathname === '/login') {
        // If user is already logged in and tries to access login page
        router.push('/');
      }
    }
  }, [user, loading, requireAuth, router, pathname, redirectTo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}