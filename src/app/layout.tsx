import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { RoomProvider } from '../context/RoomContext';
import { AuthGuard } from '../components/Auth/AuthGuard';
import { ServiceWorkerRegister } from '../components/ServiceWorkerRegister';

export const metadata: Metadata = {
  title: 'BRO SQUAD - Shared Room Expense Manager',
  description:
    'A light navy blue glassmorphic shared room expense management application for roommates with exact financial splitting and debt settlements.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BRO SQUAD',
  },
};

export const viewport: Viewport = {
  themeColor: '#173B67',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-accent/20 selection:text-navy-950 pb-16 sm:pb-8">
        <ToastProvider>
          <AuthProvider>
            <RoomProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
              <ServiceWorkerRegister />
            </RoomProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
