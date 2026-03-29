"use client";

import { motion } from "framer-motion";
import { Command, Compass, Layers, Radar, Rocket } from "lucide-react";

const links = [
  { href: "#hero", label: "Overview", icon: <Compass className="size-4" /> },
  { href: "#ai-curriculum", label: "Curriculum", icon: <Layers className="size-4" /> },
  { href: "#signal-intelligence", label: "Signals", icon: <Radar className="size-4" /> },
  { href: "#agent-lab", label: "Agent", icon: <Command className="size-4" /> },
  { href: "#deployment-blueprint", label: "Deployment", icon: <Rocket className="size-4" /> },
];

export function TopNav() {
  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="sticky top-3 z-50 mb-4 rounded-[24px] border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)]/90 p-3 shadow-[var(--shadow-elevation-2)] backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-[var(--m3-outline)]/35 bg-[var(--m3-surface-container)] px-3 py-1.5">
          <span className="size-2 rounded-full bg-emerald-300 animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-on-surface-variant)]">AI Engineer OS</span>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Primary section navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--m3-outline)]/35 bg-[var(--m3-surface-container)] px-3 py-1.5 text-xs text-[var(--m3-on-surface-variant)] transition hover:border-[var(--m3-primary)]/60 hover:text-[var(--m3-on-surface)]"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
