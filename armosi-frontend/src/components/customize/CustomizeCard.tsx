import { CustomItem } from '@/lib/types';
import { Product } from '@/lib/types';
import { ProductImageFrame } from '@/components/common/ProductImageFrame';

interface CustomizeCardProps {
  item: CustomItem | Product;
}

const WA_SVG = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="white">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
    <path d="M12 2C6.477 2 2 6.477 2 12c0 1.821.487 3.53 1.338 5L2 22l5.139-1.324A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
  </svg>
);

export function CustomizeCard({ item }: CustomizeCardProps) {
  const price = 'price' in item ? Number(item.price) || 0 : 0;
  const image = 'image' in item ? item.image : undefined;
  const sub = 'sub' in item ? item.sub : 'Tap to order by WhatsApp';
  const waText = encodeURIComponent(
    `Hi! I want to order: ${item.name}${price > 0 ? ` - Rs. ${price}` : ''}`,
  );

  return (
    <a
      href={`https://wa.me/919346459952?text=${waText}`}
      target="_blank"
      rel="noopener noreferrer"
      className="cc-press"
      style={{
        display: 'block',
        borderRadius: 'var(--r-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: 'var(--sh-sm)',
        border: '1px solid rgba(108,72,197,.06)',
        transition: 'transform .32s cubic-bezier(.34,1.56,.64,1)',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <ProductImageFrame
        src={image}
        alt={item.name}
        fallbackText={item.emoji || 'Item'}
        background="#FFFFFF"
        height={115}
        style={{ borderRadius: 0 }}
      />

      <div style={{ padding: '11px 13px 13px', background: 'white' }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{item.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--mute)', marginBottom: 6 }}>{sub}</div>
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 17, color: 'var(--vdk)', marginBottom: 9 }}>
          {price > 0 ? `₹${price}` : 'Price on WhatsApp'}
        </div>
        <span
          style={{
            width: '100%', height: 32,
            background: '#25D366', color: 'white',
            border: 'none', borderRadius: 8,
            fontSize: 11.5, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            fontFamily: 'var(--ff-body)',
            textDecoration: 'none',
          }}
        >
          <WA_SVG />
          Order on WhatsApp
        </span>
      </div>
    </a>
  );
}
