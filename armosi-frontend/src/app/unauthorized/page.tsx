import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <div className="page-body" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
      <div style={{ width: '100%', maxWidth: 360, textAlign: 'center', background: 'white', border: '1px solid var(--line)', borderRadius: 'var(--r-xl)', padding: 24, boxShadow: 'var(--sh-lg)' }}>
        <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 30, fontWeight: 400, color: 'var(--vdk)', marginBottom: 8 }}>
          Access restricted
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--mute)', lineHeight: 1.6, marginBottom: 18 }}>
          This area is only available to Armosi admins.
        </p>
        <Link href="/" style={{ color: 'var(--v)', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
          Return home
        </Link>
      </div>
    </div>
  );
}
