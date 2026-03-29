"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Cpu, LayoutTemplate, Radar } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";

export function CommandCenterHero() {
  const { scrollY } = useScroll();
  const yOffset = useTransform(scrollY, [0, 600], [0, -45]);

  return (
    <section className="relative overflow-hidden rounded-[24px] border border-[var(--m3-outline)]/50 bg-[var(--m3-surface-container-low)] p-6 shadow-[var(--shadow-elevation-3)] md:p-8">
      <motion.div style={{ y: yOffset }} className="pointer-events-none absolute inset-0 grid-overlay opacity-60" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[var(--m3-primary)]/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 size-64 rounded-full bg-[var(--m3-accent)]/35 blur-3xl" />

      <div className="relative z-10">
        <Badge>Forward Deployment Operating System</Badge>
        <h1 className="mt-4 max-w-3xl font-display text-3xl leading-tight text-[var(--m3-on-surface)] md:text-5xl">
          Interactive technical command center for FDE, AI Engineering, and Data Science execution.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--m3-on-surface-variant)] md:text-lg">
          Documentation-first architecture, live signal intelligence, interview simulation, and production-minded AI engineering playbooks in one coherent surface.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#fde-playbook"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--m3-primary)] px-5 py-2 text-sm font-semibold text-[var(--m3-on-primary)]"
          >
            Open playbook
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/repository"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-5 py-2 text-sm text-[var(--m3-on-surface)]"
          >
            Browse 300 projects
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container)] p-3">
            <div className="mb-1 flex items-center gap-2 text-[var(--m3-primary)]">
              <Radar className="size-4" />
              <p className="text-xs uppercase tracking-[0.08em]">Signal</p>
            </div>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">Live briefings filtered by relevance and deployment impact.</p>
          </div>
          <div className="rounded-2xl border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container)] p-3">
            <div className="mb-1 flex items-center gap-2 text-[var(--m3-primary)]">
              <Cpu className="size-4" />
              <p className="text-xs uppercase tracking-[0.08em]">Agent</p>
            </div>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">Groq-backed interview generation with preset workflows.</p>
          </div>
          <div className="rounded-2xl border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container)] p-3">
            <div className="mb-1 flex items-center gap-2 text-[var(--m3-primary)]">
              <LayoutTemplate className="size-4" />
              <p className="text-xs uppercase tracking-[0.08em]">Artifacts</p>
            </div>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">Ready-to-adapt templates for scoping and executive delivery.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
