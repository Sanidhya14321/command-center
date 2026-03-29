'use client';

import React, { createContext, useContext, useState } from 'react';

export type ThemeType = 'dark' | 'light' | 'ocean' | 'forest' | 'sunset' | 'cyberpunk';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeType>(() => {
    if (typeof window === 'undefined') return 'dark';
    const saved = localStorage.getItem('ai-theme') as ThemeType | null;
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      return saved;
    }
    return 'dark';
  });

  const setTheme = (newTheme: ThemeType): void => {
    setThemeState(newTheme);
    localStorage.setItem('ai-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
