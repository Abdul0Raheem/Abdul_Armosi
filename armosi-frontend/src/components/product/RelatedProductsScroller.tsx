"use client";
import React from 'react';
import type { Product } from '@/lib/types';
import { ProductImageFrame } from '@/components/common/ProductImageFrame';

export default function RelatedProductsScroller({ initial = [], all = [] }: { initial: Product[]; all: Product[] }) {
  const [items, setItems] = React.useState<Product[]>(initial || []);
  const idxRef = React.useRef(items.length);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    idxRef.current = items.length;
  }, [items.length]);

  React.useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const start = idxRef.current;
          const next = all.slice(start, start + 4);
          if (next.length > 0) {
            setItems((s) => [...s, ...next]);
          }
        }
      });
    }, { rootMargin: '0px 0px 200px 0px', threshold: 0.25 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [all]);

  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '18px 0', color: 'var(--mute)', fontSize: 14 }}>
        Browse more products while you scroll.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {items.map((related) => (
          <a key={related.id} href={`/product/${related.id}`} style={{ textDecoration: 'none' }}>
            <div className="pc-press" style={{ background: 'white', borderRadius: 'var(--r)', overflow: 'hidden', boxShadow: 'var(--sh-sm)', border: '1px solid rgba(108,72,197,.05)', cursor: 'pointer', transition: 'transform .28s cubic-bezier(.34,1.56,.64,1), box-shadow .25s', width: '100%', minHeight: 220 }}>
              <ProductImageFrame src={related.imageUrl || related.image} alt={related.name} fallbackText={related.emoji ?? 'Item'} background="#FFFFFF" height={140} style={{ borderRadius: 0 }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>{related.name}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--vdk)' }}>₹{related.price}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div ref={sentinelRef} style={{ height: 32 }} />
    </div>
  );
}
