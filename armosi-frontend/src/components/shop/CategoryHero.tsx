interface CategoryHeroProps {
  eyebrow: string;
  title: string;
  desc: string;
  variant: 'purple' | 'green' | 'amber';
}

const VARIANTS = {
  purple: { bg: 'linear-gradient(145deg,#EDE4FF,#D4BFFF)', eyebrowColor: 'rgba(74,47,154,.55)', titleColor: 'var(--vdk)' },
  green: { bg: 'linear-gradient(145deg,#E4F8F0,#B8EDD8)', eyebrowColor: 'rgba(22,101,52,.5)', titleColor: '#166534' },
  amber: { bg: 'linear-gradient(145deg,#FFF6E4,#FFDDAA)', eyebrowColor: 'rgba(120,80,20,.5)', titleColor: '#92400E' },
};

export function CategoryHero({ eyebrow, title, desc, variant }: CategoryHeroProps) {
  const v = VARIANTS[variant];
  return (
    <div style={{
      padding: 'calc(var(--nav) + 22px) 18px 22px',
      borderRadius: '0 0 26px 26px',
      marginBottom: 6,
      background: v.bg,
    }}>
      <div style={{ fontSize: 10.5, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, color: v.eyebrowColor, marginBottom: 5 }}>
        {eyebrow}
      </div>
      <h2 style={{ fontFamily: 'var(--ff-head)', fontSize: 34, fontWeight: 400, lineHeight: 1.15, marginBottom: 5, color: v.titleColor }}>
        {title}
      </h2>
      <p style={{ fontSize: 13, color: 'var(--mute)', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
