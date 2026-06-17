import Link from 'next/link';

export function HeroSection() {
  return (
    <div style={{
      marginTop: 'var(--nav)',
      background: 'linear-gradient(155deg,var(--surf) 0%,var(--vmid) 100%)',
      padding: '28px 18px 0',
      borderRadius: '0 0 30px 30px',
      overflow: 'hidden',
      position: 'relative',
      minHeight: 230,
    }}>
      <div className="anim-fadeUp" style={{ animationDelay: '.2s' }}>
        <div style={{
          fontSize: 11, letterSpacing: '.22em', textTransform: 'uppercase',
          color: 'var(--v)', fontWeight: 600, marginBottom: 10,
        }}>
          New and Unique collections
        </div>
      </div>

      <div className="anim-fadeUp" style={{ animationDelay: '.35s' }}>
        <h1 style={{
          fontFamily: 'var(--ff-head)', fontSize: 34, fontWeight: 400,
          lineHeight: 1.13, color: 'var(--ink)', marginBottom: 12,
        }}>
          Everything You<br />Need for{' '}
          <em style={{ fontStyle: 'italic', color: 'var(--vdk)' }}>Creative</em><br />
          Learning
        </h1>
      </div>

      <div className="anim-fadeUp" style={{ animationDelay: '.5s' }}>
        <p style={{
          fontSize: 13.5, color: 'var(--mute)', lineHeight: 1.65, marginBottom: 20,
        }}>
          Premium stationery, custom gifts &amp;<br />art supplies for every creative
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="anim-fadeUp" style={{ display: 'flex', gap: 10, marginBottom: 28, animationDelay: '.62s' }}>
        <Link href="/shop" style={{ textDecoration: 'none' }}>
          <button style={{
            height: 42, padding: '0 22px',
            background: 'var(--v)',
            color: 'white', border: 'none', borderRadius: 100,
            fontSize: 14, fontFamily: 'var(--ff-body)', fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(108,72,197,.32)',
            letterSpacing: '.02em',
          }}>
            Shop Now
          </button>
        </Link>
        <Link href="/customize" style={{ textDecoration: 'none' }}>
          <button style={{
            height: 42, padding: '0 22px',
            background: 'white',
            color: 'var(--vdk)',
            border: '1.5px solid var(--vl)',
            borderRadius: 100,
            fontSize: 14, fontFamily: 'var(--ff-body)', fontWeight: 600, cursor: 'pointer',
          }}>
            Customize
          </button>
        </Link>
      </div>

      {/* SVG Art */}
      <svg
        viewBox="0 0 155 165"
        fill="none"
        className="anim-fadeUp"
        style={{
          position: 'absolute', right: -8, bottom: 0,
          width: 155, height: 165,
          animationDelay: '.4s',
        }}
      >
        <rect x="18" y="72" width="68" height="88" rx="5" fill="#7C5CBF" opacity=".12" />
        <rect x="22" y="67" width="68" height="88" rx="5" fill="#A68BE0" opacity=".2" />
        <rect x="26" y="62" width="68" height="88" rx="5" fill="white" opacity=".92" />
        <rect x="26" y="62" width="68" height="13" rx="5" fill="#EDE4FF" />
        <rect x="34" y="89" width="38" height="3" rx="1.5" fill="#C4BDD8" />
        <rect x="34" y="97" width="48" height="3" rx="1.5" fill="#E4DFEF" />
        <rect x="34" y="105" width="30" height="3" rx="1.5" fill="#E4DFEF" />
        <rect x="34" y="113" width="40" height="3" rx="1.5" fill="#E4DFEF" />
        <rect x="103" y="30" width="9" height="58" rx="4.5" fill="#6C48C5" />
        <rect x="103" y="30" width="9" height="10" rx="4.5" fill="#4A2F9A" />
        <polygon points="103,88 112,88 107.5,104" fill="#FFD700" />
        <rect x="88" y="40" width="8" height="52" rx="4" fill="#FFB347" />
        <polygon points="88,92 96,92 92,106" fill="#F4A261" />
        <circle cx="138" cy="25" r="3" fill="#A68BE0" opacity=".5" />
        <circle cx="148" cy="48" r="2" fill="#6C48C5" opacity=".35" />
        <circle cx="12" cy="48" r="2.5" fill="#A68BE0" opacity=".45" />
      </svg>
    </div>
  );
}
