import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { NavBar } from '@/components/nav-bar';

export const metadata: Metadata = {
  title: 'Streetwear Store',
  description: 'Full-stack ecommerce MVP',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NavBar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
