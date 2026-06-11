'use client';

import Link from 'next/link';
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { Product } from '@/lib/types';
import type { StoreCategory } from '@/lib/categories';
import { ProductCard } from '@/components/product/ProductCard';

interface SearchOverlayContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const SearchOverlayContext = createContext<SearchOverlayContextValue>({
  open: () => {},
  close: () => {},
  isOpen: false,
});

export function SearchOverlayProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SearchOverlayContext.Provider value={{ open: () => setIsOpen(true), close: () => setIsOpen(false), isOpen }}>
      {children}
    </SearchOverlayContext.Provider>
  );
}

export function useSearchOverlay() {
  return useContext(SearchOverlayContext);
}

export function SearchOverlay() {
  const { isOpen, close } = useSearchOverlay();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<StoreCategory[]>([]);
  const [searchSettled, setSearchSettled] = useState(false);

  const suggestions = ['Notebooks', 'Pens', 'Art Supplies', 'Geometry', 'Gift Sets', 'Project Work', 'Markers', 'Stationery'];
  const normalizedQuery = normalizeSearch(debouncedQuery);
  const categoryById = useMemo(() => {
    return categories.reduce<Record<string, StoreCategory>>((map, category) => {
      map[category.id] = category;
      return map;
    }, {});
  }, [categories]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 220);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!isOpen || products.length > 0) return;

    let active = true;
    fetch('/api/search-products')
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Search unavailable')))
      .then((payload: { products?: Product[]; categories?: StoreCategory[] }) => {
        if (!active) return;
        setProducts(Array.isArray(payload.products) ? payload.products : []);
        setCategories(Array.isArray(payload.categories) ? payload.categories : []);
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
        setCategories([]);
      })
      .finally(() => {
        if (active) setSearchSettled(true);
      });

    return () => {
      active = false;
    };
  }, [isOpen, products.length]);

  const loading = isOpen && !searchSettled && products.length === 0;

  const results = useMemo(() => {
    if (!normalizedQuery) return [];

    return products.filter((product) => {
      const category = product.category ? categoryById[product.category] : undefined;
      const searchable = [
        product.name,
        product.category,
        product.subcategory,
        category?.label,
        category?.group,
        category?.parentShop,
        ...(product.tags || []),
      ];

      return normalizeSearch(searchable.filter(Boolean).join(' ')).includes(normalizedQuery);
    });
  }, [categoryById, normalizedQuery, products]);

  function applySuggestion(value: string) {
    setQuery(value);
    setDebouncedQuery(value);
  }

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(28,23,40,.55)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 400,
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
        transition: 'opacity .25s',
      }}
    >
      <div
        className={isOpen ? 'search-sheet search-sheet-open' : 'search-sheet'}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          background: 'white',
          borderRadius: '0 0 22px 22px',
          padding: 'calc(var(--nav) + 10px) 16px 20px',
          transform: isOpen ? 'translateY(0)' : 'translateY(-110%)',
          transition: 'transform .35s cubic-bezier(.4,0,.2,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <input
          type="text"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search stationery, gifts, art..."
          style={{
            width: '100%', height: 50,
            background: 'var(--surf)',
            border: '1.5px solid var(--line)',
            borderRadius: 14,
            padding: '0 18px',
            fontSize: 16,
            fontFamily: 'var(--ff-body)',
            outline: 'none',
          }}
        />

        {!normalizedQuery && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {suggestions.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => applySuggestion(suggestion)}
                style={{
                  height: 30, padding: '0 13px',
                  background: 'var(--surf)',
                  border: 'none',
                  borderRadius: 100,
                  fontSize: 13,
                  color: 'var(--mute)',
                  cursor: 'pointer',
                  fontFamily: 'var(--ff-body)',
                  transition: 'background .18s, color .18s',
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {normalizedQuery && (
          <div style={{ marginTop: 16 }}>
            {loading ? (
              <div style={{ padding: '18px 4px', color: 'var(--mute)', fontSize: 13 }}>
                Searching products...
              </div>
            ) : results.length > 0 ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ color: 'var(--ink)', fontSize: 14, fontWeight: 700 }}>
                    Search Results
                  </span>
                  <span style={{ color: 'var(--mute)', fontSize: 12 }}>
                    {results.length} found
                  </span>
                </div>
                <div
                  className="scrollbar-hide product-grid"
                  style={{
                    maxHeight: 'min(56vh, 520px)',
                    overflowY: 'auto',
                    paddingBottom: 4,
                  }}
                >
                  {results.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            ) : (
              <div style={{ padding: '28px 12px 10px', textAlign: 'center', color: 'var(--ink)' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  background: 'var(--vpale)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg viewBox="0 0 24 24" width="22" height="22" strokeWidth="2" stroke="var(--v)" fill="none">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--ff-head)', fontSize: 22, color: 'var(--vdk)', marginBottom: 5 }}>
                  No Products Found
                </div>
                <div style={{ fontSize: 13, color: 'var(--mute)' }}>
                  Try searching for another product or category.
                </div>
              </div>
            )}
          </div>
        )}

        {normalizedQuery && results.length > 0 && (
          <Link
            href="/shop"
            onClick={close}
            style={{
              display: 'inline-flex',
              marginTop: 14,
              color: 'var(--v)',
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Browse all products
          </Link>
        )}
      </div>
    </div>
  );
}

function normalizeSearch(value: string) {
  return value.toLowerCase().trim().replace(/\s+/g, ' ');
}
