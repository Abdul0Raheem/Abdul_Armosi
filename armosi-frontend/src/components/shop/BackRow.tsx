'use client';

import { useRouter } from 'next/navigation';

interface BackRowProps {
  backHref: string;
  label?: string;
}

export function BackRow({ backHref, label = 'Back to Categories' }: BackRowProps) {
  const router = useRouter();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px 0' }}>
      <button
        onClick={() => router.push(backHref)}
        style={{
          width: 36, height: 36,
          background: 'var(--surf)',
          border: 'none',
          borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background .15s',
        }}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </button>
      <span style={{ fontSize: 14, color: 'var(--mute)', fontFamily: 'var(--ff-body)' }}>{label}</span>
    </div>
  );
}
