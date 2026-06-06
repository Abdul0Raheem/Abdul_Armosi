'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Loader() {
  const [out, setOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setOut(true), 2400);
    const t2 = setTimeout(() => setHidden(true), 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (hidden) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--white)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity .65s ease, transform .65s ease',
        opacity: out ? 0 : 1,
        transform: out ? 'scale(1.05)' : 'scale(1)',
        pointerEvents: out ? 'none' : 'all',
      }}
    >
      <div className="anim-ldBob" style={{ position: 'relative', width: 220, height: 120 }}>
        <Image
          src="/armosi_logo.png"
          alt="Armosi"
          fill
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Progress bar */}
      <div
        className="anim-fadeUp-2"
        style={{
          width: 120,
          height: 3,
          background: 'var(--line)',
          borderRadius: 10,
          marginTop: 32,
          overflow: 'hidden',
        }}
      >
        <div className="ld-fill-anim" />
      </div>
    </div>
  );
}
