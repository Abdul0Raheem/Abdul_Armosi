'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { BackButton } from '@/components/common/BackButton';
import { PasswordField } from '@/components/common/PasswordField';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { db } from '@/lib/firebase';
import { getAuthErrorMessage, getUserInitials, updateUserPassword } from '@/lib/auth';

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

const fieldStyle = {
  width: '100%',
  height: 44,
  background: 'var(--surf)',
  border: '1.5px solid transparent',
  borderRadius: 'var(--r)',
  padding: '0 14px',
  fontSize: 14,
  fontFamily: 'var(--ff-body)',
  color: 'var(--ink)',
  outline: 'none',
} as const;

const labelStyle = {
  fontSize: 11.5,
  fontWeight: 700,
  color: 'var(--mute)',
  marginBottom: 6,
  display: 'block',
  letterSpacing: '.05em',
  textTransform: 'uppercase' as const,
};

function ChangePasswordForm({ canChangePassword }: { canChangePassword: boolean }) {
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'error' | 'success'>('error');
  const [updating, setUpdating] = useState(false);

  const resetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setMessageType('error');

    if (!canChangePassword) {
      setMessage('Password changes are available for email/password accounts.');
      return;
    }

    if (!currentPassword) {
      setMessage('Current password is required.');
      return;
    }

    if (newPassword.length < 6) {
      setMessage('New password should be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Confirm password must match the new password.');
      return;
    }

    setUpdating(true);

    try {
      await updateUserPassword(currentPassword, newPassword);
      resetForm();
      setMessageType('success');
      setMessage('Password updated successfully.');
      toast('Password updated successfully');
    } catch (err) {
      setMessage(getPasswordErrorMessage(err));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16, display: 'grid', gap: 13 }}>
      {message && (
        <div style={{
          background: messageType === 'success' ? '#F0FFF4' : '#FFF0F3',
          color: messageType === 'success' ? 'var(--green)' : 'var(--rose)',
          fontSize: 13,
          padding: '10px 12px',
          borderRadius: 'var(--r)',
          lineHeight: 1.45,
        }}>
          {message}
        </div>
      )}

      <div>
        <label style={labelStyle}>Current Password</label>
        <PasswordField
          variant="storefront"
          value={currentPassword}
          onChange={event => setCurrentPassword(event.target.value)}
          placeholder="Current password"
          autoComplete="current-password"
          disabled={!canChangePassword || updating}
          inputStyle={fieldStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>New Password</label>
        <PasswordField
          variant="storefront"
          value={newPassword}
          onChange={event => setNewPassword(event.target.value)}
          placeholder="New password"
          autoComplete="new-password"
          minLength={6}
          disabled={!canChangePassword || updating}
          inputStyle={fieldStyle}
        />
      </div>

      <div>
        <label style={labelStyle}>Confirm New Password</label>
        <PasswordField
          variant="storefront"
          value={confirmPassword}
          onChange={event => setConfirmPassword(event.target.value)}
          placeholder="Confirm new password"
          autoComplete="new-password"
          minLength={6}
          disabled={!canChangePassword || updating}
          inputStyle={fieldStyle}
        />
      </div>

      <button
        type="submit"
        disabled={!canChangePassword || updating}
        style={{
          width: '100%',
          height: 48,
          background: !canChangePassword || updating ? 'var(--vl)' : 'var(--v)',
          color: 'white',
          border: 'none',
          borderRadius: 'var(--r)',
          fontSize: 14.5,
          fontFamily: 'var(--ff-body)',
          fontWeight: 700,
          cursor: !canChangePassword || updating ? 'not-allowed' : 'pointer',
          letterSpacing: '.03em',
          boxShadow: '0 8px 22px rgba(108,72,197,.28)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
        }}
      >
        {updating && <span className="armosi-spinner" />}
        {updating ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}

function getPasswordErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error
    ? String((error as { code: string }).code)
    : '';

  if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Invalid current password.';
  }

  return getAuthErrorMessage(error);
}

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
  const canChangePassword = user.providerData.some(provider => provider.providerId === 'password');

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="page-body">
      <div style={{
        position: 'relative',
        background: 'linear-gradient(145deg,var(--vpale),var(--vmid))',
        padding: 'calc(var(--nav) + 24px) 18px 26px',
        textAlign: 'center',
      }}>
        <BackButton
          style={{
            position: 'absolute',
            top: 'calc(var(--nav) + 12px)',
            left: 16,
          }}
        />

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
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 8,
          padding: '5px 10px',
          borderRadius: 100,
          background: user.emailVerified ? '#F0FFF4' : 'rgba(255,255,255,.7)',
          color: user.emailVerified ? 'var(--green)' : 'var(--mute)',
          fontSize: 11.5,
          fontWeight: 700,
        }}>
          {user.emailVerified ? 'Email verified' : 'Email not verified'}
        </div>
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

        <section style={{
          marginTop: 18,
          background: 'white',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-xl)',
          padding: '20px',
          boxShadow: 'var(--sh-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40,
              height: 40,
              background: 'var(--vpale)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="var(--v)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>
                Account Settings
              </h3>
              <p style={{ fontSize: 13, color: 'var(--mute)', lineHeight: 1.4 }}>
                Change Password
              </p>
            </div>
          </div>

          {!canChangePassword && (
            <div style={{
              marginTop: 14,
              background: 'var(--surf)',
              color: 'var(--mute)',
              fontSize: 13,
              padding: '10px 12px',
              borderRadius: 'var(--r)',
              lineHeight: 1.45,
            }}>
              This account uses Google sign-in. Manage your password from your Google account.
            </div>
          )}

          <ChangePasswordForm canChangePassword={canChangePassword} />
        </section>
      </div>
    </div>
  );
}
