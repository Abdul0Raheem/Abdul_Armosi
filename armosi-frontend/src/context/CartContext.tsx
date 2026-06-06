'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '@/lib/types';

const CART_STORAGE_KEY = 'armosi-cart';

interface CartContextValue {
  cart: CartItem[];
  addToCart: (p: Product) => void;
  changeQty: (id: Product['id'], delta: number) => void;
  clearCart: () => void;
  cartCount: () => number;
  cartTotal: () => number;
}

const CartContext = createContext<CartContextValue | null>(null);

function readStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as CartItem[];
    return Array.isArray(parsed) ? parsed.filter(item => item?.id != null && item.qty > 0) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCart(readStoredCart());
      setCartLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !cartLoaded) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart, cartLoaded]);

  const addToCart = useCallback((p: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === p.id);
      if (existing) {
        return prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...p, qty: 1 }];
    });
  }, []);

  const changeQty = useCallback((id: Product['id'], delta: number) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i);
      return updated.filter(i => i.qty > 0);
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartCount = useCallback(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const cartTotal = useCallback(() => cart.reduce((s, i) => s + i.price * i.qty, 0), [cart]);

  return (
    <CartContext.Provider value={{ cart, addToCart, changeQty, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
