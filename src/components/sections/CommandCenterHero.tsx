"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, LayoutTemplate, Radar } from "lucide-react";
import { Badge } from "@/components/primitives/Badge";

export function CommandCenterHero() {
  return (
    <section id="hero" className="surface scroll-mt-24 p-6 md:p-8">

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <Badge>AI Engineering Operating System</Badge>
        <h1 className="mt-4 max-w-4xl font-display text-3xl leading-tight text-[var(--m3-on-surface)] md:text-5xl">
          Documentation-first AI engineering hub for learning, system design, and execution.
        </h1>
        <p className="mt-4 max-w-4xl text-base leading-8 text-[var(--m3-on-surface-variant)]">
          Move from concept to production with practical playbooks, architecture simulators, interview workflows, and real-world project references.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="#ai-curriculum"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-primary)] bg-[var(--m3-primary)] px-5 py-2 text-sm font-semibold text-[var(--m3-on-primary)]"
          >
            Explore AI engineering
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="#agent-lab"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-5 py-2 text-sm text-[var(--m3-on-surface)]"
          >
            Run interview agent
          </Link>
          <Link
            href="/repository"
            className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-5 py-2 text-sm text-[var(--m3-on-surface)]"
          >
            Browse 300 projects
          </Link>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="surface-muted p-3">
            <div className="mb-1 flex items-center gap-2 text-[var(--m3-primary)]">
              <Radar className="size-4" />
              <p className="text-xs uppercase tracking-[0.08em]">Signal</p>
            </div>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">Live briefings filtered by relevance and deployment impact.</p>
          </div>
          <div className="surface-muted p-3">
            <div className="mb-1 flex items-center gap-2 text-[var(--m3-primary)]">
              <Cpu className="size-4" />
              <p className="text-xs uppercase tracking-[0.08em]">Agent</p>
            </div>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">Groq-backed interview generation with preset workflows.</p>
          </div>
          <div className="surface-muted p-3">
            <div className="mb-1 flex items-center gap-2 text-[var(--m3-primary)]">
              <LayoutTemplate className="size-4" />
              <p className="text-xs uppercase tracking-[0.08em]">Artifacts</p>
            </div>
            <p className="text-sm text-[var(--m3-on-surface-variant)]">Ready-to-adapt templates for scoping and executive delivery.</p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
