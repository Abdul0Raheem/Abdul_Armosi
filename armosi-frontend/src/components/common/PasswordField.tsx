'use client';

import { useState, type CSSProperties, type InputHTMLAttributes } from 'react';

type PasswordFieldVariant = 'storefront' | 'admin';

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  variant?: PasswordFieldVariant;
  inputStyle?: CSSProperties;
}

function EyeOpen() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeClosed() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M9.9 5.1A10.7 10.7 0 0 1 12 5c6.5 0 10 7 10 7a17.8 17.8 0 0 1-4.1 5.2" />
      <path d="M6.2 6.2C3.5 8.3 2 12 2 12a17.8 17.8 0 0 0 6.5 5.8" />
    </svg>
  );
}

export function PasswordField({
  variant = 'storefront',
  inputStyle,
  className,
  style,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  const toggleColor = variant === 'admin' ? 'var(--adm-muted)' : 'var(--mute)';

  return (
    <div className={variant === 'admin' ? 'adm-password-wrap' : undefined} style={{ position: 'relative', width: '100%' }}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={className}
        style={{
          width: '100%',
          paddingRight: 44,
          ...style,
          ...inputStyle,
        }}
      />
      <button
        type="button"
        onClick={() => setVisible(current => !current)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className={variant === 'admin' ? 'adm-password-toggle' : undefined}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 32,
          height: 32,
          border: 'none',
          background: 'transparent',
          color: toggleColor,
          cursor: 'pointer',
          borderRadius: 8,
        }}
      >
        {visible ? <EyeClosed /> : <EyeOpen />}
      </button>
    </div>
  );
}
