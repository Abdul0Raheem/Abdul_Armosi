'use client';

import { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface ProductDetailActionsProps {
  product: Product;
}

export function ProductDetailActions({ product }: ProductDetailActionsProps) {
  const { addToCart, isInCart } = useCart();
  const { toast } = useToast();
  const added = isInCart(product.id);

  function handleAddToCart() {
    if (added) return;
    addToCart(product);
    toast('Item added to cart');
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={added}
      className="product-detail-addtocart"
      style={{
        width: '100%',
        background: added ? 'var(--vpale)' : 'var(--v)',
        color: added ? 'var(--v)' : 'white',
        border: 'none',
        borderRadius: 16,
        height: 46,
        fontSize: 14,
        fontWeight: 700,
        cursor: added ? 'default' : 'pointer',
        boxShadow: '0 18px 42px rgba(108,72,197,.15)',
      }}
      aria-label={added ? `${product.name} already in cart` : `Add ${product.name} to cart`}
    >
      {added ? '✓ Added to Cart' : '+ Add to Cart'}
    </button>
  );
}
