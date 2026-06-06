import { StoreInfo } from '@/components/about/StoreInfo';

const WA_SVG = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="#25D366">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.139-1.324A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

const features = [
  { emoji: '🚚', label: 'Fast Delivery' },
  { emoji: '✨', label: 'Premium Quality' },
  { emoji: '🎁', label: 'Gift Wrapping' },
  { emoji: '💬', label: '24/7 Support' },
];

export default function AboutPage() {
  return (
    <div className="page-body">
      {/* Hero */}
      <div style={{
        padding: 'calc(var(--nav) + 26px) 18px 28px',
        background: 'linear-gradient(155deg,var(--surf),var(--vmid))',
        textAlign: 'center',
        borderRadius: '0 0 28px 28px',
      }}>
        <h1 style={{ fontFamily: 'var(--ff-head)', fontSize: 42, fontWeight: 400, color: 'var(--vdk)', marginBottom: 10 }}>
          About<br />Armosi
        </h1>
        <p style={{ fontSize: 14, color: 'var(--mute)', lineHeight: 1.7, maxWidth: 300, margin: '0 auto' }}>
          We believe stationery is more than tools — it&apos;s an expression of who you are and how you create.
        </p>
      </div>

      {/* Cards */}
      <div style={{ padding: '24px 18px' }}>
        {/* Story */}
        <div style={{ background: 'var(--surf)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 13 }}>
          <h3 style={{ fontFamily: 'var(--ff-head)', fontSize: 21, fontWeight: 500, marginBottom: 7, color: 'var(--vdk)' }}>
            Our Story
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--mute)', lineHeight: 1.7 }}>
            Founded in Hyderabad, Armosi was born from a love of beautiful stationery and a passion for helping students and creatives find the perfect tools. Every product is curated with care, elegance, and quality in mind.
          </p>
        </div>

        {/* Custom Orders */}
        <div style={{ background: 'var(--surf)', borderRadius: 'var(--r-lg)', padding: 20, marginBottom: 13 }}>
          <h3 style={{ fontFamily: 'var(--ff-head)', fontSize: 21, fontWeight: 500, marginBottom: 7, color: 'var(--vdk)' }}>
            Custom Orders
          </h3>
          <p style={{ fontSize: 13.5, color: 'var(--mute)', lineHeight: 1.7 }}>
            We specialize in personalized stationery — from custom-engraved pens to branded notebooks. Place your order via WhatsApp and our team will craft something truly special.
          </p>
          <a
            href="https://wa.me/919346459952"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              marginTop: 12, color: '#25D366', fontWeight: 600, fontSize: 14,
              textDecoration: 'none',
            }}
          >
            <WA_SVG />
            Chat on WhatsApp
          </a>
        </div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11, marginTop: 18 }}>
          {features.map(f => (
            <div key={f.label} style={{
              background: 'white', borderRadius: 'var(--r)', padding: 15,
              textAlign: 'center', boxShadow: 'var(--sh-sm)',
            }}>
              <span style={{ fontSize: 26, display: 'block', marginBottom: 6 }}>{f.emoji}</span>
              <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--mute)' }}>{f.label}</span>
            </div>
          ))}
        </div>

        <StoreInfo />
      </div>
    </div>
  );
}
