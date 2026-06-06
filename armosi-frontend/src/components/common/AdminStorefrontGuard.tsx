'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Keeps the public storefront for customers and guests.
 * Logged-in admins are sent to /admin instead of seeing shop pages.
 */
export function AdminStorefrontGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAdmin, loading, roleLoading } = useAuth();

  const checking = loading || roleLoading;
  const shouldRedirect = Boolean(user && isAdmin);

  useEffect(() => {
    if (checking || !shouldRedirect) return;
    router.replace('/admin');
  }, [checking, shouldRedirect, router]);

  if (shouldRedirect) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--surf)',
        }}
      >
        <p style={{ color: 'var(--mute)', fontSize: 14 }}>Opening admin panel...</p>
      </div>
    );
  }

  return <>{children}</>;
}
