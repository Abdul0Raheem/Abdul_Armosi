'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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

  const tags = ['📝 Notebooks', '🖊️ Pens', '🎨 Art Supplies', '📐 Geometry', '🎁 Gift Sets', '📏 Project Work'];

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
          placeholder="Search stationery, gifts, art…"
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
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
          {tags.map(tag => (
            <button
              key={tag}
              style={{
                height: 30, padding: '0 13px',
                background: 'var(--surf)',
                border: 'none',
                borderRadius: 100,
                fontSize: 13,
                color: 'var(--mute)',
                cursor: 'pointer',
                fontFamily: 'var(--ff-body)',
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
