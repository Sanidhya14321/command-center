"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, LayoutTemplate, Radar } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";

export function CommandCenterHero() {
  return (
    <section id="hero" className="surface scroll-mt-24 px-4 py-8 sm:px-6 md:px-8 md:py-12 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Badge>AI Engineering Operating System</Badge>
          <h1 className="mt-4 max-w-4xl font-display text-3xl leading-tight text-[var(--m3-on-surface)] sm:text-4xl md:text-5xl lg:text-6xl">
            Documentation-first AI engineering hub for learning, system design, and execution.
          </h1>
          <p className="mt-4 max-w-4xl text-base leading-relaxed text-[var(--m3-on-surface-variant)] md:text-lg">
            Move from concept to production with practical playbooks, architecture simulators, interview workflows, and real-world project references.
          </p>

          <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            <Link
              href="#ai-curriculum"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--m3-primary)] bg-[var(--m3-primary)] px-4 sm:px-6 py-2.5 text-sm font-semibold text-[var(--m3-on-primary)] hover:bg-[var(--m3-primary)]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2 min-h-[40px]"
              aria-label="Explore AI engineering curriculum"
            >
              <span>Explore AI engineering</span>
              <ArrowRight className="size-4 shrink-0" />
            </Link>
            <Link
              href="#agent-lab"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-4 sm:px-6 py-2.5 text-sm font-medium text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container-high)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] min-h-[40px]"
              aria-label="Run interview agent"
            >
              <span>Run interview agent</span>
            </Link>
            <Link
              href="/repository"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-4 sm:px-6 py-2.5 text-sm font-medium text-[var(--m3-on-surface)] hover:bg-[var(--m3-surface-container-high)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] min-h-[40px]"
              aria-label="Browse 300 projects"
            >
              <span>Browse projects</span>
            </Link>
          </div>

          <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-3">
            <article className="surface-muted rounded-lg border border-[var(--m3-outline)]/30 p-4 sm:p-5 hover:border-[var(--m3-outline)]/60 transition-colors">
              <div className="mb-3 flex items-center gap-2 text-[var(--m3-primary)]">
                <Radar className="size-5 shrink-0" aria-hidden="true" />
                <h3 className="text-xs uppercase tracking-[0.1em] font-semibold">Signal Intelligence</h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">Live briefings filtered by relevance and deployment impact for informed decision-making.</p>
            </article>
            <article className="surface-muted rounded-lg border border-[var(--m3-outline)]/30 p-4 sm:p-5 hover:border-[var(--m3-outline)]/60 transition-colors">
              <div className="mb-3 flex items-center gap-2 text-[var(--m3-primary)]">
                <Cpu className="size-5 shrink-0" aria-hidden="true" />
                <h3 className="text-xs uppercase tracking-[0.1em] font-semibold">Agent Lab</h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">Groq-backed interview generation with preset workflows and real-time execution.</p>
            </article>
            <article className="surface-muted rounded-lg border border-[var(--m3-outline)]/30 p-4 sm:p-5 hover:border-[var(--m3-outline)]/60 transition-colors">
              <div className="mb-3 flex items-center gap-2 text-[var(--m3-primary)]">
                <LayoutTemplate className="size-5 shrink-0" aria-hidden="true" />
                <h3 className="text-xs uppercase tracking-[0.1em] font-semibold">Artifacts</h3>
              </div>
              <p className="text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">Ready-to-adapt templates for scoping, architecture, and executive delivery.</p>
            </article>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
