"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Command, Compass, FileText, Layers, Radar } from "lucide-react";
import { ThemeSelector } from "./ThemeSelector";

const links = [
  { href: "#hero", label: "Overview", icon: <Compass className="size-4" /> },
  { href: "/playbook", label: "Playbook", icon: <FileText className="size-4" /> },
  { href: "#ai-curriculum", label: "AI Engineering", icon: <Layers className="size-4" /> },
  { href: "#signal-intelligence", label: "Signals", icon: <Radar className="size-4" /> },
  { href: "#agent-lab", label: "Agent", icon: <Command className="size-4" /> },
];

export function TopNav() {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 130, damping: 24, mass: 0.2 });

  return (
    <motion.header className="sticky top-3 z-50 mb-4 surface p-3">
      <motion.div className="absolute left-0 top-0 h-[2px] w-full origin-left bg-[var(--m3-primary)]" style={{ scaleX: progress }} />
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2 rounded-full border border-[var(--m3-outline)] px-3 py-1.5">
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-on-surface-variant)]">AI Engineering Hub</span>
        </div>
        <nav className="flex flex-wrap gap-2" aria-label="Primary section navigation">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-1.5 text-xs text-[var(--m3-on-surface-variant)] transition hover:text-[var(--m3-on-surface)]"
            >
              {link.icon}
              {link.label}
            </a>
          ))}
        </nav>
        <ThemeSelector />
      </div>
    </motion.header>
  );
}
