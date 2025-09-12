// src/utils/useSystemTheme.ts
import { useState, useEffect } from 'react';

type Theme = 'dark' | 'light';

const getInitialTheme = (): Theme => {
  if (typeof window === 'undefined') {
    return 'light'; // Fallback for server-side rendering
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export function useSystemTheme(): Theme {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      setTheme(mediaQuery.matches ? 'dark' : 'light');
    };

    // Add listener for changes
    mediaQuery.addEventListener('change', handleChange);

    // Clean up listener on component unmount
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return theme;
}