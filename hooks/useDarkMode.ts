'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseDarkModeReturn {
  isDark: boolean;
  toggle: () => void;
  setDark: (value: boolean) => void;
}

export function useDarkMode(): UseDarkModeReturn {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved preference or system preference
    const savedPreference = localStorage.getItem('darkMode');
    const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const shouldBeDark = savedPreference !== null
      ? savedPreference === 'true'
      : systemPreference;

    setIsDark(shouldBeDark);

    // Apply to document
    if (shouldBeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const setDark = useCallback((value: boolean) => {
    setIsDark(value);
    localStorage.setItem('darkMode', String(value));

    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = useCallback(() => {
    setDark(!isDark);
  }, [isDark, setDark]);

  return { isDark, toggle, setDark };
}
