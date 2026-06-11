'use client';

import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useSearchOverlay } from '@/components/common/SearchOverlay';

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" strokeWidth="2" stroke="var(--mute)" fill="none">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);

const CartIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="20" r="1.5" />
    <circle cx="18" cy="20" r="1.5" />
    <path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H7" />
  </svg>
);

const desktopNavItems = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Customize', href: '/customize' },
  { name: 'About', href: '/about' },
];

const profileItem = { name: 'Profile', href: '/profile' };

const authLinkStyle = (variant: 'login' | 'signup'): CSSProperties => ({
  height: 34,
  padding: '0 13px',
  background: variant === 'signup' ? 'var(--v)' : 'var(--vpale)',
  border: variant === 'signup' ? 'none' : '1px solid rgba(108,72,197,.12)',
  borderRadius: 100,
  fontSize: 12.5,
  fontFamily: 'var(--ff-body)',
  color: variant === 'signup' ? 'white' : 'var(--v)',
  fontWeight: 700,
  cursor: 'pointer',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  transition: 'background .18s, color .18s, transform .12s',
});

export function Navbar() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { user, loading } = useAuth();
  const { open } = useSearchOverlay();

  if (pathname === '/login' || pathname === '/signup' || pathname.startsWith('/admin')) return null;

  const count = cartCount();
  const showAuthLinks = !loading && !user;

  return (
    <nav
      className="app-fixed"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 'var(--nav)',
        zIndex: 200,
        background: 'rgba(255,255,255,.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 10,
        width: '100%',
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0, minWidth: 0 }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: 'white',
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Image
            src="/armosi_logo_only.png"
            alt="Armosi"
            width={96}
            height={96}
            priority
            style={{
              width: 30,
              height: 30,
              objectFit: 'contain',
            }}
          />
        </div>
        <span style={{ fontFamily: 'var(--ff-head)', fontSize: 20, fontWeight: 500, color: 'var(--vdk)', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>
          Armosi
        </span>
      </Link>

      <div className="desktop-nav" style={{ alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {[...desktopNavItems, profileItem].map(item => {
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                height: 34,
                padding: '0 12px',
                background: isActive ? 'var(--vpale)' : 'transparent',
                border: 'none',
                borderRadius: 100,
                fontSize: 12.5,
                fontFamily: 'var(--ff-body)',
                color: isActive ? 'var(--v)' : 'var(--vdk)',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
              }}
            >
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ flex: '1 1 auto', minWidth: 0, position: 'relative' }}>
        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
          <SearchIcon />
        </span>
        <input
          readOnly
          onClick={open}
          placeholder="Search products…"
          style={{
            width: '100%', height: 34,
            background: 'var(--surf)',
            border: '1.5px solid transparent',
            borderRadius: 100,
            padding: '0 12px 0 34px',
            fontSize: 13,
            fontFamily: 'var(--ff-body)',
            color: 'var(--ink)',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexShrink: 0, minWidth: 0 }}>
        {showAuthLinks && (
          <>
            <Link href="/login" className="auth-nav-link" style={authLinkStyle('login')}>
              Login
            </Link>
            <Link href="/signup" className="auth-nav-link" style={authLinkStyle('signup')}>
              Signup
            </Link>
          </>
        )}

        <Link href="/profile" className="mobile-profile-link" style={{
          height: 34, padding: '0 13px',
          background: 'var(--surf)',
          border: 'none',
          borderRadius: 100,
          fontSize: 12.5,
          fontFamily: 'var(--ff-body)',
          color: 'var(--vdk)',
          fontWeight: 500,
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'flex', alignItems: 'center',
        }}>
          Profile
        </Link>

        <Link href="/about" className="mobile-about-link" style={{
          height: 34, padding: '0 13px',
          background: 'var(--surf)',
          border: 'none',
          borderRadius: 100,
          fontSize: 12.5,
          fontFamily: 'var(--ff-body)',
          color: 'var(--vdk)',
          fontWeight: 500,
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'flex', alignItems: 'center',
        }}>
          About
        </Link>

        <Link href="/cart" style={{ position: 'relative', textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34,
            background: 'var(--v)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CartIcon />
            {count > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                width: 15, height: 15,
                background: 'var(--rose)',
                borderRadius: '50%',
                fontSize: 9.5,
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700,
                border: '2px solid white',
              }}>
                {count}
              </span>
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
}
