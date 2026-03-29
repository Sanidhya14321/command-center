'use client';

import { useTheme, type ThemeType } from '@/lib/ThemeContext';
import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';

const THEMES: { value: ThemeType; label: string; icon: React.ReactNode }[] = [
  { value: 'system', label: 'System', icon: <Monitor className="size-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="size-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="size-4" /> },
  { value: 'dim', label: 'Dim', icon: <Palette className="size-4" /> },
];

export const ThemeSelector = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-m3-outline px-3 py-2 text-sm hover:bg-m3-surface-container transition-colors"
        title="Switch theme"
        aria-label="Theme selector"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline capitalize text-xs">{theme === 'system' ? `System (${resolvedTheme})` : theme}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-m3-surface-container rounded-xl border border-m3-outline z-50 p-2">
          <p className="px-2 py-1 text-xs font-semibold text-m3-on-surface-variant uppercase tracking-wider">
            Themes
          </p>
          <div className="grid gap-1">
            {THEMES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  theme === value
                    ? 'bg-m3-primary text-m3-on-primary font-semibold'
                    : 'hover:bg-m3-surface-container-high text-m3-on-surface'
                }`}
              >
                {icon}
                {label}
                {theme === value ? <Check className="ml-auto size-4" /> : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
