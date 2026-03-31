"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Command, Compass, FileText, Layers, Radar } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";

const links = [
  { href: "#hero", label: "Overview", icon: <Compass className="size-4" />, shortLabel: "Over" },
  { href: "/playbook", label: "Playbook", icon: <FileText className="size-4" />, shortLabel: "Play" },
  { href: "#ai-curriculum", label: "AI Engineering", icon: <Layers className="size-4" />, shortLabel: "AI" },
  { href: "#signal-intelligence", label: "Signals", icon: <Radar className="size-4" />, shortLabel: "Sig" },
  { href: "#agent-lab", label: "Agent", icon: <Command className="size-4" />, shortLabel: "Agent" },
];

export function TopNav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 24, mass: 0.2 });

  return (
    <motion.header className="sticky top-3 z-50 mb-4 surface p-3 lg:p-4" role="banner">
      <motion.div className="absolute left-0 top-0 h-[2px] w-full origin-left bg-[var(--m3-primary)]" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="flex flex-col gap-3 pt-1 md:flex-row md:items-center md:justify-between">
        {/* Logo/Title */}
        <div className="flex items-center gap-2 rounded-full border border-[var(--m3-outline)] px-3 py-1.5 shrink-0">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-on-surface-variant)]">AI Hub</span>
        </div>
        
        {/* Navigation and Theme */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 min-w-0">
          <nav className="flex flex-wrap gap-1.5 md:gap-2" aria-label="Primary section navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex items-center gap-1.5 md:gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-2.5 md:px-3 py-1.5 text-xs text-[var(--m3-on-surface-variant)] transition hover:bg-[var(--m3-surface-container-high)] hover:text-[var(--m3-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] min-h-[36px]"
                aria-label={link.label}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.shortLabel}</span>
              </a>
            ))}
          </nav>
          <div className="shrink-0">
            <ThemeSelector />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
