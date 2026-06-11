import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="page-body" style={{ padding: '80px 18px 34px', textAlign: 'center' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 14 }}>Product not found</div>
        <div style={{ color: 'var(--mute)', fontSize: 15, lineHeight: 1.8, marginBottom: 24 }}>
          We couldn&apos;t find the product you were looking for. It may have been removed or the product ID is invalid.
        </div>
        <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '12px 20px', borderRadius: 14, background: 'var(--v)', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
          Back to shop
        </Link>
      </div>
    </div>
  );
}
