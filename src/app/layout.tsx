import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { RoomProvider } from '../context/RoomContext';
import { Header } from '../components/Navigation/Header';
import { BottomNav } from '../components/Navigation/BottomNav';
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
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-1 max-w-4xl w-full mx-auto px-2 sm:px-4 pt-2 sm:pt-3">
                  {children}
                </main>
                <BottomNav />
              </div>
              <ServiceWorkerRegister />
            </RoomProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
