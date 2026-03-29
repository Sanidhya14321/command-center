'use client';

import { useTheme, type ThemeType } from '@/lib/ThemeContext';
import { Palette } from 'lucide-react';
import { useState } from 'react';

const THEMES: { value: ThemeType; label: string; color: string }[] = [
  { value: 'dark', label: 'Dark', color: 'bg-slate-900' },
  { value: 'light', label: 'Light', color: 'bg-white' },
  { value: 'ocean', label: 'Ocean', color: 'bg-blue-900' },
  { value: 'forest', label: 'Forest', color: 'bg-emerald-900' },
  { value: 'sunset', label: 'Sunset', color: 'bg-orange-900' },
  { value: 'cyberpunk', label: 'Cyberpunk', color: 'bg-violet-900' },
];

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
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
        <span className="hidden sm:inline capitalize text-xs">{theme}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-m3-surface-container rounded-xl border border-m3-outline shadow-lg z-50 p-2">
          <p className="px-2 py-1 text-xs font-semibold text-m3-on-surface-variant uppercase tracking-wider">
            Themes
          </p>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map(({ value, label, color }) => (
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
                <div className={`w-3 h-3 rounded-full ${color}`} />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
