'use client';

import { useEffect } from 'react';

export const ServiceWorkerRegister: React.FC = () => {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('BRO SQUAD PWA service worker registered', reg.scope))
        .catch((err) => console.log('Service worker registration failed:', err));
    }
  }, []);

  return null;
};
