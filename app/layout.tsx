import './globals.css';
import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { CartProvider } from '@/lib/cart/cart-store';
import { Providers } from '@/components/providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-cormorant', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'TrG Studio — Style. Confidence. You.',
  description: 'Bags, shoes, and accessories selected for your next chapter.',
  icons: { icon: '/favicon.png', apple: '/apple-touch-icon.png' },
  openGraph: { title: 'TrG Studio', description: 'Bags, shoes, and accessories selected for your next chapter.', images: ['/trg-logo.jpg'] },
  twitter: { images: ['/trg-logo.jpg'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className={`${inter.variable} ${cormorant.variable}`}><Providers><CartProvider>{children}</CartProvider></Providers></body></html>;
}
