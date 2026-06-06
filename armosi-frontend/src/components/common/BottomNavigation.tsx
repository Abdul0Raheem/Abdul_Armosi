'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  {
    name: 'Home', href: '/',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke={active ? 'var(--v)' : 'var(--mute)'} strokeWidth="1.7">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    name: 'Shop', href: '/shop',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke={active ? 'var(--v)' : 'var(--mute)'} strokeWidth="1.7">
        <rect x="2" y="3" width="9" height="9" rx="2" />
        <rect x="13" y="3" width="9" height="9" rx="2" />
        <rect x="2" y="14" width="9" height="9" rx="2" />
        <rect x="13" y="14" width="9" height="9" rx="2" />
      </svg>
    ),
  },
  {
    name: 'Cart', href: '/cart',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke={active ? 'var(--v)' : 'var(--mute)'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="20" r="1.5" />
        <circle cx="18" cy="20" r="1.5" />
        <path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H7" />
      </svg>
    ),
  },
  {
    name: 'Profile', href: '/profile',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
        stroke={active ? 'var(--v)' : 'var(--mute)'} strokeWidth="1.7">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BottomNavigation() {
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/admin')) return null;

  return (
    <div className="app-fixed bottom-nav" style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 'var(--bot)',
      zIndex: 200,
      background: 'rgba(255,255,255,.96)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid var(--line)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '0 4px 6px',
    }}>
      {navItems.map(item => {
        const isActive = item.href === '/'
          ? pathname === '/'
          : pathname.startsWith(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '8px 14px',
              cursor: 'pointer',
              borderRadius: 14,
              flex: 1,
              textDecoration: 'none',
              background: isActive ? 'var(--vpale)' : 'transparent',
              transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)',
            }}
          >
            {item.icon(isActive)}
            <span style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '.02em',
              color: isActive ? 'var(--v)' : 'var(--mute)',
              fontFamily: 'var(--ff-body)',
            }}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
