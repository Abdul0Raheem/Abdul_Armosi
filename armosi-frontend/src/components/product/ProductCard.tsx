'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { ProductImageFrame } from '@/components/common/ProductImageFrame';
import type { CSSProperties } from 'react';

interface ProductCardProps {
  product: Product;
  style?: CSSProperties;
}

export function ProductCard({ product, style }: ProductCardProps) {
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const added = isInCart(product.id);
  const imageUrl = product.imageUrl || product.image;
  const productHref = product.id != null ? `/product/${encodeURIComponent(String(product.id))}` : '/shop';

  if (process.env.NODE_ENV === 'development') {
    console.log('[ProductCard] productId=', product.id, 'href=', productHref);
  }

  function handleAddToCart() {
    if (added) return;
    addToCart(product);
    toast('Item added to cart');
  }

  return (
    <div
      className="pc-press"
      style={{
        background: 'white',
        borderRadius: 'var(--r)',
        overflow: 'hidden',
        boxShadow: 'var(--sh-sm)',
        border: '1px solid rgba(108,72,197,.05)',
        cursor: 'pointer',
        transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .25s',
        width: '100%',
        ...style,
      }}
    >
      <Link href={productHref} style={{ color: 'inherit', textDecoration: 'none' }}>
        <ProductImageFrame
          src={imageUrl}
          alt={product.name}
          fallbackText={product.emoji ?? 'Item'}
          background="#FFFFFF"
          height={106}
          style={{ borderRadius: 0 }}
        />

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
        </div>
      </Link>
      <div style={{ padding: '0 11px 11px' }}>
        <button
          onClick={handleAddToCart}
          disabled={added}
          aria-label={added ? `${product.name} added to cart` : `Add ${product.name} to cart`}
          style={{
            width: '100%', height: 28,
            background: added ? 'var(--vpale)' : 'var(--v)',
            color: added ? 'var(--v)' : 'white',
            border: 'none',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            cursor: added ? 'default' : 'pointer',
            fontFamily: 'var(--ff-body)',
            letterSpacing: '.03em',
            transition: 'background .18s, color .18s, transform .12s',
            opacity: added ? .92 : 1,
          }}
        >
          {added ? '✓ Added to Cart' : '+ Add to Cart'}
        </button>
      </div>
    </div>
  );
}
