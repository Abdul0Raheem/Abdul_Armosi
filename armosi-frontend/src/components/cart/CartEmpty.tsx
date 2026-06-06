import Link from 'next/link';

export function CartEmpty() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '60px 24px', textAlign: 'center',
    }}>
      <div style={{
        width: 76, height: 76, background: 'var(--vpale)', borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
      }}>
        <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="var(--v)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="9" cy="20" r="1.5" />
          <circle cx="18" cy="20" r="1.5" />
          <path d="M3 4h2l2.6 11.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 8H7" />
        </svg>
      </div>
      <h3 style={{ fontSize: 19, fontWeight: 600, marginBottom: 7 }}>Your cart is empty</h3>
      <p style={{ color: 'var(--mute)', fontSize: 13.5, marginBottom: 22 }}>
        Add some beautiful stationery to get started
      </p>
      <Link href="/shop" style={{ textDecoration: 'none' }}>
        <button style={{
          height: 42, padding: '0 22px',
          background: 'var(--v)', color: 'white', border: 'none', borderRadius: 100,
          fontSize: 14, fontFamily: 'var(--ff-body)', fontWeight: 600, cursor: 'pointer',
          boxShadow: '0 6px 18px rgba(108,72,197,.32)',
        }}>
          Browse Products
        </button>
      </Link>
    </div>
  );
}
