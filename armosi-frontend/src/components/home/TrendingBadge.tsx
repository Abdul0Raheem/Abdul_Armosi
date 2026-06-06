export function TrendingBadge() {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: 'linear-gradient(90deg,#FFF0EA,#FFEDF5)',
      color: '#C0384A',
      fontSize: 10.5, fontWeight: 700, letterSpacing: '.1em',
      textTransform: 'uppercase',
      padding: '4px 10px',
      borderRadius: 100,
      marginBottom: 12,
    }}>
      <svg viewBox="0 0 24 24" width="11" height="11" fill="#C0384A">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
      Trending
    </div>
  );
}
