'use client';

import Image from 'next/image';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordField } from '@/components/common/PasswordField';
import { useAuth } from '@/context/AuthContext';

function getLoginErrorMessage(error: unknown) {
  const code =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
      ? error.code
      : '';

  if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
    return 'Incorrect email or password.';
  }

  if (code === 'auth/operation-not-allowed') {
    return 'Email/password login is not enabled. Please contact support.';
  }

  if (code === 'auth/api-key-not-valid' || code === 'auth/invalid-api-key') {
    return 'Login is not configured correctly. Please contact support.';
  }

  if (error instanceof Error && error.name === 'AdminAccessError') {
    return error.message;
  }

  return 'Login failed. Please check your details and try again.';
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInAdmin, user, isAdmin, loading: authLoading, roleLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (user && isAdmin) {
      router.replace('/admin');
    }
  }, [authLoading, isAdmin, roleLoading, router, user]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInAdmin(email, password);
      router.push('/admin');
    } catch (err) {
      setError(getLoginErrorMessage(err));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-screen">
      <div className="adm-login-wrap">
        <section className="adm-login-brand">
          <div className="adm-login-brand-inner">
            <Image
              src="/armosi_logo.png"
              alt="Armosi"
              width={220}
              height={120}
              priority
              style={{ objectFit: 'contain', marginBottom: 28 }}
            />
            <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: 36, fontWeight: 400, lineHeight: 1.15, marginBottom: 12 }}>
              Manage your store
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 360 }}>
              Add products, track orders, and keep your Armosi catalog up to date — from desktop or mobile.
            </p>
          </div>
        </section>

        <section className="adm-login-form-panel">
          <div className="adm-login-card">
            <div className="adm-login-mobile-logo">
              <Image
                src="/armosi_logo.png"
                alt="Armosi"
                width={180}
                height={96}
                priority
                style={{ objectFit: 'contain' }}
              />
            </div>

            <div className="adm-card adm-card-padded">
              <h1 className="adm-page-title" style={{ fontSize: '1.85rem', marginBottom: 6 }}>
                Admin Login
              </h1>
              <p className="adm-page-subtitle" style={{ marginBottom: 24 }}>
                Sign in with your admin account to continue.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="adm-label" htmlFor="admin-email">Email</label>
                  <input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="adm-input"
                    placeholder="admin@example.com"
                    autoComplete="username"
                  />
                </div>

                <div>
                  <label className="adm-label" htmlFor="admin-password">Password</label>
                  <PasswordField
                    id="admin-password"
                    variant="admin"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="adm-input"
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                </div>

                {error && <div className="adm-error">{error}</div>}

                <button
                  type="submit"
                  disabled={loading}
                  className="adm-btn adm-btn-primary adm-btn-block"
                  style={{ marginTop: 8 }}
                >
                  {loading ? 'Signing in...' : 'Sign in to Admin'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
