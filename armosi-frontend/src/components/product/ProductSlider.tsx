import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface ProductSliderProps {
  products: Product[];
}

export function ProductSlider({ products }: ProductSliderProps) {
  return (
    <div
      className="scrollbar-hide"
      style={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollBehavior: 'smooth',
        padding: '0 18px 16px',
        display: 'flex',
        gap: 12,
      }}
    >
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
