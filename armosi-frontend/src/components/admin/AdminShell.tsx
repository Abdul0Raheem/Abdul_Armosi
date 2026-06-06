'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: '/admin/orders',
    label: 'Orders',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M6 6h15l-1.5 9h-12z" />
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M6 6 5 3H2" />
      </svg>
    ),
  },
  {
    href: '/admin/products',
    label: 'Products',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.3 7 12 12l8.7-5M12 22V12" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Users',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

function isActive(pathname: string, href: string) {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isLogin = pathname === '/admin/login';

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  const exitToShop = async () => {
    await logout();
    router.push('/');
  };

  if (isLogin) {
    return <>{children}</>;
  }

  return (
    <AdminGuard>
      <div className="admin-shell">
        <div className="adm-layout">
          <aside className="adm-sidebar">
            <div className="adm-sidebar-brand">
              <Image
                src="/armosi_logo_only.png"
                alt="Armosi"
                width={44}
                height={44}
                style={{ objectFit: 'contain', borderRadius: 12, background: 'rgba(255,255,255,0.08)', padding: 6 }}
              />
              <div>
                <h1>Armosi</h1>
                <span>Admin Panel</span>
              </div>
            </div>

            <nav className="adm-nav">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`adm-nav-link ${isActive(pathname, item.href) ? 'adm-nav-link-active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: 24 }}>
              <button type="button" onClick={exitToShop} className="adm-nav-link" style={{ width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                </svg>
                Exit & view shop
              </button>
            </div>
          </aside>

          <div className="adm-main">
            <header className="adm-topbar">
              <div className="adm-topbar-inner">
                <div style={{ minWidth: 0 }}>
                  <div className="adm-topbar-user">Admin Dashboard</div>
                  <div className="adm-topbar-email">{user?.email}</div>
                </div>
                <div className="adm-topbar-actions">
                  <button type="button" onClick={exitToShop} className="adm-btn adm-btn-secondary adm-btn-sm">
                    Exit to shop
                  </button>
                  <button type="button" onClick={handleLogout} className="adm-btn adm-btn-danger adm-btn-sm">
                    Logout
                  </button>
                </div>
              </div>

              <nav className="adm-mobile-nav" aria-label="Admin navigation">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`adm-mobile-nav-link ${isActive(pathname, item.href) ? 'adm-mobile-nav-link-active' : ''}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </header>

            <div className="adm-content">{children}</div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
