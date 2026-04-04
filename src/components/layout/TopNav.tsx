"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Command, Compass, FileText, Layers, Radar, Sparkles } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";

const links = [
  { href: "#hero", label: "Overview", icon: <Compass className="size-4" />, shortLabel: "Over" },
  { href: "/playbook", label: "Playbook", icon: <FileText className="size-4" />, shortLabel: "Play" },
  { href: "#ai-curriculum", label: "AI Engineering", icon: <Layers className="size-4" />, shortLabel: "AI" },
  { href: "#signal-intelligence", label: "Signals", icon: <Radar className="size-4" />, shortLabel: "Sig" },
  { href: "/generated-content", label: "Generated", icon: <Sparkles className="size-4" />, shortLabel: "Gen" },
  { href: "#agent-lab", label: "Agent", icon: <Command className="size-4" />, shortLabel: "Agent" },
];

export function TopNav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 24, mass: 0.2 });

  return (
    <motion.header className="sticky top-3 z-50 mb-4 surface p-3 lg:p-4" role="banner">
      <motion.div className="absolute left-0 top-0 h-[2px] w-full origin-left bg-[var(--m3-primary)]" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="flex flex-col gap-3 pt-1">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] p-2.5">
              <Command className="size-4 text-[var(--m3-primary)]" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-secondary)]">AI Engineering Command Center</p>
              <p className="truncate text-sm font-medium text-[var(--m3-on-surface)]">Operational cockpit for curriculum, systems, and execution</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <div className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-1.5 text-xs text-[var(--m3-on-surface-variant)]">
              <span className="size-1.5 rounded-full bg-[var(--success)]" aria-hidden="true" />
              <span>Live signal sync</span>
            </div>
            <ThemeSelector />
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-1.5 md:gap-2" aria-label="Primary section navigation">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="inline-flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-2.5 py-1.5 text-xs text-[var(--m3-on-surface-variant)] transition-colors duration-200 hover:border-[var(--m3-primary)]/60 hover:bg-[var(--m3-surface-container-high)] hover:text-[var(--m3-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] md:gap-2 md:px-3"
                aria-label={link.label}
              >
                {link.icon}
                <span className="hidden sm:inline">{link.label}</span>
                <span className="sm:hidden">{link.shortLabel}</span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 text-xs text-[var(--m3-on-surface-variant)]">
            <span className="rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] px-2.5 py-1">300+ Projects</span>
            <span className="rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] px-2.5 py-1">12 Active Modules</span>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
