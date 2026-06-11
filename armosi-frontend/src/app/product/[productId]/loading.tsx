export default function ProductLoading() {
  return (
    <div className="page-body" style={{ padding: '80px 18px 34px', textAlign: 'center' }}>
      <div style={{ maxWidth: 520, margin: '0 auto' }}>
        <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Loading product details…</div>
        <div style={{ color: 'var(--mute)', fontSize: 15, lineHeight: 1.8 }}>Just a moment while we fetch the latest product information for you.</div>
      </div>
    </div>
  );
}
