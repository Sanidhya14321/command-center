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
        className="flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2 text-sm hover:bg-[var(--m3-surface-container-high)]"
        title="Switch theme"
        aria-label="Theme selector"
      >
        <Palette className="w-4 h-4" />
        <span className="hidden sm:inline capitalize text-xs">{theme === 'system' ? `System (${resolvedTheme})` : theme}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-56 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] p-2">
          <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--m3-on-surface-variant)]">
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
                    ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)] font-semibold'
                    : 'text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container-high)]'
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
