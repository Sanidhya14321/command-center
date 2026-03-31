"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChartNoAxesCombined, Cpu, LayoutTemplate, Radar, ShieldCheck, Workflow } from "lucide-react";
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
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
            <div>
              <Badge>AI Engineering Operating System</Badge>
              <h1 className="mt-4 max-w-4xl font-display text-3xl leading-tight text-[var(--m3-on-surface)] sm:text-4xl md:text-5xl lg:text-6xl">
                Run your AI learning and delivery stack from one command surface.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--m3-on-surface-variant)] md:text-lg">
                Track signals, execute playbooks, pressure-test architecture decisions, and build interview confidence with integrated tooling designed for high-output engineering teams.
              </p>

              <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
                <Link
                  href="#ai-curriculum"
                  className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--m3-primary)] bg-[var(--m3-primary)] px-4 py-2.5 text-sm font-semibold text-[var(--m3-on-primary)] transition-colors duration-200 hover:bg-[var(--m3-primary)]/90 focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] focus:ring-offset-2 focus:ring-offset-[var(--m3-surface)] sm:px-6"
                  aria-label="Explore AI engineering curriculum"
                >
                  <span>Explore AI engineering</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Link>
                <Link
                  href="#agent-lab"
                  className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-4 py-2.5 text-sm font-medium text-[var(--m3-on-surface)] transition-colors duration-200 hover:bg-[var(--m3-surface-container-high)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] sm:px-6"
                  aria-label="Run interview agent"
                >
                  <span>Run interview agent</span>
                </Link>
                <Link
                  href="/repository"
                  className="inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-4 py-2.5 text-sm font-medium text-[var(--m3-on-surface)] transition-colors duration-200 hover:bg-[var(--m3-surface-container-high)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] sm:px-6"
                  aria-label="Browse 300 projects"
                >
                  <span>Browse projects</span>
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <article className="surface-muted rounded-lg border border-[var(--m3-outline)]/40 p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">Live Signals</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--m3-on-surface)]">128</p>
                  <p className="mt-1 text-xs text-[var(--success)]">+14 this week</p>
                </article>
                <article className="surface-muted rounded-lg border border-[var(--m3-outline)]/40 p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">Readiness Score</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--m3-on-surface)]">87%</p>
                  <p className="mt-1 text-xs text-[var(--success)]">System design trend up</p>
                </article>
                <article className="surface-muted rounded-lg border border-[var(--m3-outline)]/40 p-4">
                  <p className="text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">Artifacts</p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--m3-on-surface)]">42</p>
                  <p className="mt-1 text-xs text-[var(--m3-on-surface-variant)]">Ready to reuse</p>
                </article>
              </div>
            </div>

            <aside className="surface-muted rounded-xl border border-[var(--m3-outline)]/55 p-4 sm:p-5 lg:p-6" aria-label="System status overview">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-secondary)]">System Status</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--success)]/40 bg-[var(--success)]/10 px-2 py-0.5 text-xs text-[var(--success)]">Healthy</span>
              </div>

              <div className="space-y-3">
                <div className="rounded-md border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container)] p-3">
                  <div className="flex items-center justify-between text-xs text-[var(--m3-on-surface-variant)]">
                    <span className="inline-flex items-center gap-1"><Workflow className="size-3.5" /> Pipeline Throughput</span>
                    <span>92%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[var(--m3-surface-container-high)]">
                    <div className="h-full w-[92%] rounded-full bg-[var(--m3-primary)]" />
                  </div>
                </div>
                <div className="rounded-md border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container)] p-3">
                  <div className="flex items-center justify-between text-xs text-[var(--m3-on-surface-variant)]">
                    <span className="inline-flex items-center gap-1"><ChartNoAxesCombined className="size-3.5" /> Interview Accuracy</span>
                    <span>84%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[var(--m3-surface-container-high)]">
                    <div className="h-full w-[84%] rounded-full bg-[var(--success)]" />
                  </div>
                </div>
                <div className="rounded-md border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container)] p-3">
                  <div className="flex items-center justify-between text-xs text-[var(--m3-on-surface-variant)]">
                    <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> Governance Coverage</span>
                    <span>100%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-[var(--m3-surface-container-high)]">
                    <div className="h-full w-full rounded-full bg-[var(--accent)]" />
                  </div>
                </div>
              </div>
            </aside>
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
