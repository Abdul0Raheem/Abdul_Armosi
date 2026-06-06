'use client';

import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  function handleAddToCart() {
    addToCart(product);
    toast(`${product.emoji ?? 'Item'} Added to cart!`);
  }

  return (
    <div
      className="pc-press"
      style={{
        flexShrink: 0,
        width: 142,
        background: 'white',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        boxShadow: 'var(--sh-sm)',
        border: '1px solid rgba(108,72,197,.05)',
        cursor: 'pointer',
        transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .25s',
      }}
    >
      <div style={{
        width: '100%', height: 106,
        background: product.bg ?? '#FFF8EC',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 38,
      }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          product.emoji ?? 'Item'
        )}
      </div>

      <div style={{ padding: '9px 11px 11px' }}>
        <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.38, marginBottom: 4, color: 'var(--ink)' }}>
          {product.name}
        </div>
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 17, color: 'var(--vdk)', marginBottom: 7 }}>
          ₹{product.price}{' '}
          {product.mrp != null && (
            <span style={{ fontSize: 10.5, color: 'var(--mute)', fontFamily: 'var(--ff-body)', fontWeight: 400 }}>
              ₹{product.mrp}
            </span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          style={{
            width: '100%', height: 28,
            background: 'var(--v)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--ff-body)',
            letterSpacing: '.03em',
            transition: 'background .18s, transform .12s',
          }}
        >
          + Add to Cart
        </button>
      </div>
    </div>
  );
}
