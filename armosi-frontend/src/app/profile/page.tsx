'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserInitials } from '@/lib/auth';

interface UserDetails {
  phone?: string;
  address?: string;
}

const menuItems = [
  {
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--v)" strokeWidth="1.8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    ),
    label: 'My Orders',
    href: '/orders',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--v)" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
    label: 'About Armosi',
    href: '/about',
  },
];

const ChevronRight = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--mute)" strokeWidth="2" strokeLinecap="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [details, setDetails] = useState<UserDetails>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/profile');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;

    getDoc(doc(db, 'users', user.uid))
      .then(snapshot => {
        if (!snapshot.exists()) return;
        const data = snapshot.data();
        setDetails({
          phone: data.phone ? String(data.phone) : '',
          address: data.address ? String(data.address) : '',
        });
      })
      .catch(() => null);
  }, [user]);

  if (loading || !user) {
    return (
      <div className="page-body" style={{ padding: '120px 18px', textAlign: 'center' }}>
        <p style={{ color: 'var(--mute)' }}>Loading profile...</p>
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split('@')[0] || 'Armosi Customer';
  const initials = getUserInitials(displayName);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="page-body">
      <div style={{
        background: 'linear-gradient(145deg,var(--vpale),var(--vmid))',
        padding: 'calc(var(--nav) + 24px) 18px 26px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 76,
          height: 76,
          background: 'linear-gradient(135deg,var(--v),var(--vl))',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: 28,
          fontWeight: 600,
          color: 'white',
          boxShadow: 'var(--sh-md)',
        }}>
          {initials}
        </div>
        <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: 26, marginBottom: 3 }}>{displayName}</h2>
        <p style={{ fontSize: 13, color: 'var(--mute)' }}>{user.email}</p>
        {details.phone && (
          <p style={{ fontSize: 13, color: 'var(--mute)', marginTop: 6 }}>{details.phone}</p>
        )}
        {details.address && (
          <p style={{ fontSize: 12.5, color: 'var(--mute)', marginTop: 4, lineHeight: 1.5, maxWidth: 280, marginInline: 'auto' }}>
            {details.address}
          </p>
        )}
      </div>

      <div style={{ padding: '18px' }}>
        {menuItems.map((item, index) => (
          <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 13,
              padding: '14px 0',
              borderBottom: index < menuItems.length - 1 ? '1px solid var(--line)' : 'none',
              cursor: 'pointer',
            }}>
              <div style={{ width: 38, height: 38, background: 'var(--vpale)', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {item.icon}
              </div>
              <span style={{ fontSize: 14.5, fontWeight: 500, flex: 1, color: 'var(--ink)' }}>{item.label}</span>
              <ChevronRight />
            </div>
          </Link>
        ))}

        <button
          type="button"
          onClick={handleSignOut}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            padding: '14px 0',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            textAlign: 'left',
          }}
        >
          <div style={{ width: 38, height: 38, background: '#FFF0F3', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--rose)" strokeWidth="1.8">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </div>
          <span style={{ fontSize: 14.5, fontWeight: 500, color: 'var(--rose)' }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
