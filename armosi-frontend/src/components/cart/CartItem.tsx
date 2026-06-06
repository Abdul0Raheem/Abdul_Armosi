'use client';

import { CartItem as CartItemType } from '@/lib/types';
import { useCart } from '@/context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { changeQty } = useCart();

  return (
    <div style={{ display: 'flex', gap: 13, padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
      {/* Product image */}
      <div style={{
        width: 66, height: 66, borderRadius: 12, background: 'var(--surf)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, flexShrink: 0, overflow: 'hidden',
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          item.emoji ?? 'Item'
        )}
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
