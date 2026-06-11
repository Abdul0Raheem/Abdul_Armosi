'use client';

import { useRouter } from 'next/navigation';
import type { CSSProperties } from 'react';

interface BackButtonProps {
  fallbackHref?: string;
  style?: CSSProperties;
}

export function BackButton({ fallbackHref = '/', style }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className="armosi-back-button"
      style={{
        height: 38,
        padding: '0 14px 0 11px',
        borderRadius: 100,
        border: '1px solid rgba(108,72,197,.14)',
        background: 'rgba(255,255,255,.86)',
        color: 'var(--v)',
        boxShadow: 'var(--sh-sm)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--ff-body)',
        fontSize: 13,
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'transform .18s, background .18s, box-shadow .18s',
        zIndex: 20,
        ...style,
      }}
    >
      <svg className="armosi-back-icon" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}
