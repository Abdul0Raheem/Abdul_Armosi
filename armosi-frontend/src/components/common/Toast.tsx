'use client';

import { useToast } from '@/context/ToastContext';

export function Toast() {
  const { message, visible } = useToast();

  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--bot) + 14px)',
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? '0' : '16px'})`,
      background: 'var(--ink)',
      color: 'white',
      padding: '9px 20px',
      borderRadius: 100,
      fontSize: 13,
      maxWidth: 'calc(100vw - 32px)',
      whiteSpace: 'normal',
      textAlign: 'center',
      zIndex: 999,
      opacity: visible ? 1 : 0,
      pointerEvents: 'none',
      transition: 'all .35s cubic-bezier(.34,1.56,.64,1)',
      fontFamily: 'var(--ff-body)',
    }}>
      {message}
    </div>
  );
}
