'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { BackButton } from '@/components/common/BackButton';
import { PasswordField } from '@/components/common/PasswordField';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { completeGoogleRedirectSignIn, getAuthErrorMessage, sendPasswordReset } from '@/lib/auth';

type LoginMode = 'signin' | 'signup' | 'admin';

interface LoginPageClientProps {
  forcedMode?: LoginMode;
  defaultRedirect?: string;
}

const fieldStyle = {
  width: '100%',
  height: 46,
  background: 'var(--surf)',
  border: '1.5px solid transparent',
  borderRadius: 'var(--r)',
  padding: '0 15px',
  fontSize: 15,
  fontFamily: 'var(--ff-body)',
  color: 'var(--ink)',
  outline: 'none',
} as const;

const labelStyle = {
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--mute)',
  marginBottom: 5,
  display: 'block',
  letterSpacing: '.05em',
  textTransform: 'uppercase' as const,
};

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function getInitialMode(mode: string | null): LoginMode {
  if (mode === 'signup' || mode === 'admin') return mode;
  return 'signin';
}

export default function LoginPageClient({
  forcedMode,
  defaultRedirect = '/profile',
}: LoginPageClientProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || defaultRedirect;
  const initialMode = forcedMode || getInitialMode(searchParams.get('mode'));

  const {
    signIn,
    signInAdmin,
    signUp,
    signInWithGoogle,
    user,
    isAdmin,
    roleLoading,
    loading: authLoading,
  } = useAuth();
  const { toast } = useToast();
  const [mode, setMode] = useState<LoginMode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  useEffect(() => {
    completeGoogleRedirectSignIn()
      .then(redirectUser => {
        if (redirectUser) {
          router.replace(redirectTo);
        }
      })
      .catch(err => {
        setError(getAuthErrorMessage(err));
      })
      .finally(() => {
        setCheckingRedirect(false);
      });
  }, [redirectTo, router]);

  useEffect(() => {
    if (authLoading || checkingRedirect || !user) return;
    if (roleLoading) return;

    if (isAdmin) {
      router.replace('/admin');
      return;
    }

    if (mode === 'admin') {
      router.replace('/');
      return;
    }

    router.replace(redirectTo);
  }, [authLoading, checkingRedirect, isAdmin, mode, redirectTo, roleLoading, router, user]);

  const switchMode = (nextMode: LoginMode) => {
    setMode(nextMode);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password should be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'admin') {
        await signInAdmin(email, password);
        router.push('/admin');
      } else if (mode === 'signup') {
        await signUp(name, email, password);
        router.push(redirectTo);
      } else {
        await signIn(email, password);
        router.push(redirectTo);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);

    try {
      const signedInUser = await signInWithGoogle();
      if (signedInUser) {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');

    if (!email.trim()) {
      setError('Enter your email first, then request a password reset.');
      return;
    }

    setLoading(true);

    try {
      await sendPasswordReset(email);
      toast('Password reset email sent');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || checkingRedirect || user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--mute)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="login-screen" style={{
      minHeight: '100vh',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '32px 20px 48px',
      background: 'radial-gradient(ellipse 80% 50% at 50% 0%,var(--vmid),var(--white) 70%)',
    }}>
      <BackButton
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
        <div style={{
          width: 76,
          height: 76,
          borderRadius: 20,
          background: 'white',
          border: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--sh-lg)',
          marginBottom: 14,
        }}>
          <Image src="/armosi_logo_only.png" alt="Armosi" width={52} height={52} priority style={{ objectFit: 'contain' }} />
        </div>
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 38, fontWeight: 400, color: 'var(--vdk)', letterSpacing: '.06em' }}>
          Armosi
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--mute)', letterSpacing: '.1em', marginTop: 2 }}>
          Everything for creative learning
        </div>
      </div>

      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'white',
        borderRadius: 'var(--r-xl)',
        padding: '26px 22px',
        boxShadow: 'var(--sh-lg)',
      }}>
        <div style={{ fontSize: 21, fontWeight: 500, marginBottom: 4 }}>
          {mode === 'admin' ? 'Admin login' : mode === 'signup' ? 'Create account' : 'Welcome back'}
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--mute)', marginBottom: 18 }}>
          {mode === 'admin'
            ? 'Secure access for the Armosi team'
            : mode === 'signup'
              ? 'Join Armosi for orders, offers & more'
              : 'Sign in to your stationery world'}
        </div>

        {error && (
          <div style={{
            background: '#FFF0F3',
            color: 'var(--rose)',
            fontSize: 13,
            padding: '10px 12px',
            borderRadius: 'var(--r)',
            marginBottom: 14,
            lineHeight: 1.45,
          }}>
            {error}
          </div>
        )}

        {mode !== 'admin' && (
          <>
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              style={{
                width: '100%',
                height: 48,
                background: 'white',
                border: '1.5px solid var(--line)',
                borderRadius: 'var(--r)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                fontSize: 14,
                fontFamily: 'var(--ff-body)',
                color: 'var(--ink)',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: 'var(--sh-sm)',
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0 16px', color: 'var(--mute)', fontSize: 12.5 }}>
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
              or use email
              <span style={{ flex: 1, height: 1, background: 'var(--line)' }} />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Your name"
                required
                style={fieldStyle}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={event => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete={mode === 'admin' ? 'username' : 'email'}
              required
              style={fieldStyle}
            />
          </div>

          <div style={{ marginBottom: mode === 'signup' ? 14 : 0 }}>
            <label style={labelStyle}>Password</label>
            <PasswordField
              variant="storefront"
              value={password}
              onChange={event => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete={mode === 'admin' ? 'current-password' : mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              inputStyle={fieldStyle}
            />
          </div>

          {mode === 'signin' && (
            <div style={{ marginTop: 9, textAlign: 'right' }}>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                style={{
                  border: 'none',
                  background: 'none',
                  color: 'var(--v)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--ff-body)',
                  fontSize: 12.5,
                  fontWeight: 700,
                  padding: 0,
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Confirm password</label>
              <PasswordField
                variant="storefront"
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
                minLength={6}
                inputStyle={fieldStyle}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: 50,
              background: loading ? 'var(--vl)' : 'var(--v)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--r)',
              fontSize: 15,
              fontFamily: 'var(--ff-body)',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 18,
              letterSpacing: '.03em',
              boxShadow: '0 8px 22px rgba(108,72,197,.32)',
            }}
          >
            {loading ? 'Please wait...' : mode === 'admin' ? 'Enter Admin Dashboard' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {mode === 'admin' ? (
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--mute)' }}>
            Customer login?{' '}
            <button
              type="button"
              onClick={() => switchMode('signin')}
              style={{ color: 'var(--v)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Sign in here
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'var(--mute)' }}>
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  style={{ color: 'var(--v)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to Armosi?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  style={{ color: 'var(--v)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Create account
                </button>
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <Link href="/" style={{ fontSize: 12.5, color: 'var(--mute)', textDecoration: 'none' }}>
            Continue as guest
          </Link>
        </div>

        {mode !== 'admin' && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--line)', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => router.push('/admin/login')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--mute)',
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '.04em',
                padding: '4px 8px',
              }}
            >
              Admin Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
