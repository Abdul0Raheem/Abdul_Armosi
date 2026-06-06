'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, roleLoading, isAdmin } = useAuth();
  const checking = loading || roleLoading;

  useEffect(() => {
    if (checking) return;

    if (!user) {
      router.replace('/admin/login');
      return;
    }

    if (!isAdmin) {
      router.replace('/unauthorized');
    }
  }, [checking, isAdmin, router, user]);

  if (checking || !user || !isAdmin) {
    return (
      <div className="admin-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--adm-bg)' }}>
        <div className="adm-card adm-card-padded" style={{ textAlign: 'center', maxWidth: 320 }}>
          <div className="adm-spinner" />
          <p style={{ color: 'var(--adm-muted)', fontSize: 14 }}>Checking admin access...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
