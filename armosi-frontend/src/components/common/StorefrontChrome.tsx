'use client';

import { usePathname } from 'next/navigation';
import { AdminStorefrontGuard } from '@/components/common/AdminStorefrontGuard';
import { Navbar } from '@/components/common/Navbar';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { WhatsAppButton } from '@/components/common/WhatsAppButton';
import { Toast } from '@/components/common/Toast';
import { SearchOverlay, SearchOverlayProvider } from '@/components/common/SearchOverlay';

export function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideChrome = pathname.startsWith('/admin');

  if (hideChrome) {
    return <>{children}</>;
  }

  return (
    <AdminStorefrontGuard>
      <SearchOverlayProvider>
        <div id="app" style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'var(--white)', overflowX: 'hidden' }}>
          <Navbar />
          <main style={{ width: '100%', maxWidth: '100vw', overflowX: 'hidden' }}>{children}</main>
          <BottomNavigation />
          <WhatsAppButton />
          <Toast />
          <SearchOverlay />
        </div>
      </SearchOverlayProvider>
    </AdminStorefrontGuard>
  );
}
