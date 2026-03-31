'use client';

import { useTheme, type ThemeType } from '@/lib/ThemeContext';
import { Check, Monitor, Moon, Palette, Sun } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

const THEMES: { value: ThemeType; label: string; icon: React.ReactNode }[] = [
  { value: 'system', label: 'System', icon: <Monitor className="size-4" /> },
  { value: 'light', label: 'Light', icon: <Sun className="size-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="size-4" /> },
  { value: 'dim', label: 'Dim', icon: <Palette className="size-4" /> },
];

export const ThemeSelector = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2 text-sm font-medium hover:bg-[var(--m3-surface-container-high)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2 focus:ring-offset-[var(--m3-surface)] min-h-[40px]"
        title="Switch theme"
        aria-label="Theme selector"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Palette className="size-4 shrink-0" />
        <span className="hidden sm:inline capitalize text-xs">{theme === 'system' ? `System (${resolvedTheme})` : theme}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 z-50 mt-2 w-48 sm:w-56 rounded-lg border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] p-2 shadow-lg" role="menu">
          <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-[var(--m3-on-surface-variant)]" id="theme-label">
            Select Theme
          </p>
          <div className="mt-2 space-y-1" aria-labelledby="theme-label">
            {THEMES.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => {
                  setTheme(value);
                  setIsOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setTheme(value);
                    setIsOpen(false);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-1 min-h-[40px] ${
                  theme === value
                    ? 'bg-[var(--m3-primary)]/16 text-[var(--m3-primary)] font-semibold border border-[var(--m3-primary)]/40'
                    : 'text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container-high)] border border-transparent'
                }`}
                role="menuitemradio"
                aria-checked={theme === value}
              >
                <span className="flex items-center justify-center">{icon}</span>
                <span className="flex-1 text-left">{label}</span>
                {theme === value ? <Check className="size-4 shrink-0" aria-hidden="true" /> : null}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
