'use client';

import React, { createContext, useContext, useState } from 'react';

export type ThemeType = 'system' | 'light' | 'dark' | 'dim';

interface ThemeContextType {
  theme: ThemeType;
  resolvedTheme: Exclude<ThemeType, 'system'>;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function resolveSystemTheme(): Exclude<ThemeType, 'system'> {
  if (typeof window === 'undefined') return 'dark';
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyThemeToDocument(theme: ThemeType): Exclude<ThemeType, 'system'> {
  const resolved = theme === 'system' ? resolveSystemTheme() : theme;
  document.documentElement.setAttribute('data-theme', resolved);
  return resolved;
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window === 'undefined') return 'system';
    const saved = localStorage.getItem('ai-theme') as ThemeType | null;
    const nextTheme = saved || 'system';
    applyThemeToDocument(nextTheme);
    return nextTheme;
  });

  const [resolvedTheme, setResolvedTheme] = useState<Exclude<ThemeType, 'system'>>(() => {
    if (typeof window === 'undefined') return 'dark';
    return applyThemeToDocument((localStorage.getItem('ai-theme') as ThemeType | null) || 'system');
  });

  const setTheme = (newTheme: ThemeType): void => {
    setThemeState(newTheme);
    const resolved = applyThemeToDocument(newTheme);
    setResolvedTheme(resolved);
    localStorage.setItem('ai-theme', newTheme);
  };

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(applyThemeToDocument('system'));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
