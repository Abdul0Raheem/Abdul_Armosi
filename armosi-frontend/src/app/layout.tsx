import type { Metadata } from 'next';
import { Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { StorefrontChrome } from '@/components/common/StorefrontChrome';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Armosi — Premium Stationery',
  description: 'Everything You Need for Creative Learning. Premium stationery, custom gifts & art supplies.',
  icons: {
    icon: '/armosi_logo_only.png',
    apple: '/armosi_logo_only.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${outfit.variable}`}
        style={{ fontFamily: 'var(--ff-body)' }}
      >
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <StorefrontChrome>{children}</StorefrontChrome>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
