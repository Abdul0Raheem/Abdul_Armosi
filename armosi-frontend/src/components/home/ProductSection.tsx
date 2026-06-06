import Link from 'next/link';
import { Product } from '@/lib/types';
import { ProductSlider } from '@/components/product/ProductSlider';

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
}

const ArrowRight = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--v)" strokeWidth="2.5" strokeLinecap="round">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

export function ProductSection({ title, products, viewAllHref }: ProductSectionProps) {
  return (
    <div style={{ marginTop: 30 }}>
      {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 18px', marginBottom: 12,
      }}>
        <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '.01em', color: 'var(--ink)' }}>
          {title}
        </span>
        {viewAllHref && (
          <Link href={viewAllHref} style={{
            fontSize: 12.5, color: 'var(--v)', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: 3,
            textDecoration: 'none',
          }}>
            View All <ArrowRight />
          </Link>
        )}
      </div>

      <ProductSlider products={products} />
    </div>
  );
}
