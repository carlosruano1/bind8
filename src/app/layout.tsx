import './globals.css';
import { Playfair_Display, Cormorant_Garamond } from 'next/font/google';
import { Providers } from './providers';

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({ 
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const metadata = {
  title: 'Bind8 - Wedding Websites',
  description: 'Create beautiful wedding websites in minutes',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable}`}>
      <body className="bg-white text-gray-900 font-cormorant">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
