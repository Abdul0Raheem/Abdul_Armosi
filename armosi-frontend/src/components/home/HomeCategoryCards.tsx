import Link from 'next/link';

interface HomeCategoryCardProps {
  eyebrow: string;
  title: string;
  emoji: string;
  href: string;
  variant: 'purple' | 'blue';
}

function HomeCategoryCard({ eyebrow, title, emoji, href, variant }: HomeCategoryCardProps) {
  const isBlue = variant === 'blue';

  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        className="hcat-press"
        style={{
          borderRadius: 'var(--r-lg)',
          padding: '20px 16px',
          cursor: 'pointer',
          minHeight: 136,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: isBlue
            ? 'linear-gradient(145deg,#DFF3FF,#BAE0FF)'
            : 'linear-gradient(145deg,#EDE4FF,#D4BFFF)',
          transition: 'transform .32s cubic-bezier(.34,1.56,.64,1), box-shadow .28s',
        }}
      >
        <div>
          <div style={{
            fontSize: 10.5, letterSpacing: '.15em', textTransform: 'uppercase',
            fontWeight: 700,
            color: isBlue ? 'rgba(29,78,150,.55)' : 'rgba(74,47,154,.55)',
            marginBottom: 5,
          }}>
            {eyebrow}
          </div>
          <div style={{
            fontFamily: 'var(--ff-head)', fontSize: 24, fontWeight: 500,
            color: isBlue ? '#1D4E96' : 'var(--vdk)', lineHeight: 1.18,
          }}>
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontSize: 26 }}>{emoji}</span>
          <div style={{
            width: 26, height: 26,
            background: isBlue ? '#2A7BD5' : 'var(--v)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function HomeCategoryCards() {
  return (
    <div style={{
      padding: '26px 18px 0',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
    }}>
      <HomeCategoryCard
        eyebrow="Personal"
        title="Customize"
        emoji="✏️"
        href="/customize"
        variant="purple"
      />
      <HomeCategoryCard
        eyebrow="Browse"
        title="Stationery"
        emoji="📚"
        href="/shop"
        variant="blue"
      />
    </div>
  );
}
