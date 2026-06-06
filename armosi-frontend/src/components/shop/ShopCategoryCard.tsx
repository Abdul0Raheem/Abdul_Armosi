import Link from 'next/link';

interface ShopCategoryCardProps {
  eyebrow: string;
  name: string;
  desc: string;
  emoji: string;
  href: string;
  variant: 'purple' | 'green' | 'amber';
}

const VARIANTS = {
  purple: {
    bg: 'linear-gradient(140deg,#EDE4FF,#D2BAFF)',
    eyebrowColor: 'rgba(74,47,154,.5)',
    nameColor: 'var(--vdk)',
    arrBg: 'var(--v)',
  },
  green: {
    bg: 'linear-gradient(140deg,#E4F8F0,#B8EDD8)',
    eyebrowColor: 'rgba(22,101,52,.5)',
    nameColor: '#166534',
    arrBg: '#16A34A',
  },
  amber: {
    bg: 'linear-gradient(140deg,#FFF6E4,#FFDDAA)',
    eyebrowColor: 'rgba(120,80,20,.5)',
    nameColor: '#92400E',
    arrBg: '#D97706',
  },
};

export function ShopCategoryCard({ eyebrow, name, desc, emoji, href, variant }: ShopCategoryCardProps) {
  const v = VARIANTS[variant];
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div
        className="scat-press"
        style={{
          borderRadius: 'var(--r-xl)',
          padding: '24px 22px',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: v.bg,
          transition: 'transform .32s cubic-bezier(.34,1.56,.64,1), box-shadow .28s',
          boxShadow: 'var(--sh-sm)',
        }}
      >
        {/* Text */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, color: v.eyebrowColor, marginBottom: 5 }}>
            {eyebrow}
          </div>
          <div style={{ fontFamily: 'var(--ff-head)', fontSize: 26, fontWeight: 500, color: v.nameColor, lineHeight: 1.15 }}>
            {name}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--mute)', marginTop: 4 }}>{desc}</div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0, marginLeft: 14 }}>
          <span style={{ fontSize: 44 }}>{emoji}</span>
          <div style={{
            width: 32, height: 32,
            background: v.arrBg,
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--sh-sm)',
          }}>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
