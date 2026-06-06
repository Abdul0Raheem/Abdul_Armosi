export function ShopHero() {
  return (
    <div style={{
      padding: 'calc(var(--nav) + 24px) 18px 24px',
      background: 'linear-gradient(155deg,var(--surf),var(--vmid))',
      borderRadius: '0 0 28px 28px',
    }}>
      <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 36, fontWeight: 400, color: 'var(--vdk)', marginBottom: 6 }}>
        Stationery Items
      </h1>
      <p style={{ fontSize: 13.5, color: 'var(--mute)', lineHeight: 1.6 }}>
        Explore our premium curated collections — find exactly what you need
      </p>
    </div>
  );
}
