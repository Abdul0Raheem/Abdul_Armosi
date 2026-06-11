'use client';

import { CartItem as CartItemType } from '@/lib/types';
import { useCart } from '@/context/CartContext';
import { ProductImageFrame } from '@/components/common/ProductImageFrame';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { changeQty } = useCart();
  const imageUrl = item.imageUrl || item.image;

  return (
    <div style={{ display: 'flex', gap: 13, padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
      {/* Product image */}
      <div style={{ width: 66, minWidth: 66, borderRadius: 12, overflow: 'hidden' }}>
        <ProductImageFrame
          src={imageUrl}
          alt={item.name}
          fallbackText={item.emoji ?? 'Item'}
          background="#FFFFFF"
          height={66}
          style={{ borderRadius: 12 }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{item.name}</div>
        <div style={{ fontFamily: 'var(--ff-head)', fontSize: 19, color: 'var(--vdk)' }}>₹{item.price}</div>

        {/* Qty controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 7 }}>
          <button
            onClick={() => changeQty(item.id, -1)}
            style={{
              width: 26, height: 26, background: 'var(--surf)', border: 'none', borderRadius: 7,
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink)', transition: 'background .14s',
            }}
          >
            −
          </button>
          <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 18, textAlign: 'center' }}>{item.qty}</span>
          <button
            onClick={() => changeQty(item.id, 1)}
            style={{
              width: 26, height: 26, background: 'var(--surf)', border: 'none', borderRadius: 7,
              fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--ink)', transition: 'background .14s',
            }}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
