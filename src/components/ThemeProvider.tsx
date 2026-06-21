'use client';

import { useSimbaStore } from '@/store/useSimbaStore';
import { useEffect, useRef } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const isDarkMode = useSimbaStore((state) => state.isDarkMode);
  const toggleDarkMode = useSimbaStore((state) => state.toggleDarkMode);
  const initialized = useRef(false);

  // On first mount, respect system preference if the user hasn't made an explicit choice.
  // Zustand persists isDarkMode to localStorage; the default in the store is `false`.
  // We detect whether the persisted value differs from the system preference and sync once.
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const stored = localStorage.getItem('simba-store-v2');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (!stored) {
      // No persisted preference yet — follow the system
      if (systemPrefersDark) {
        toggleDarkMode(); // sets isDarkMode to true
      }
    }
    // If there IS a stored preference we respect it as-is (user made an explicit choice)
  }, []);

  // Keep the <html> class in sync with the store value
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return <>{children}</>;
}
