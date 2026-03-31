"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Bug, Wrench } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";

type FailureMode = {
  system: string;
  failure: string;
  cause: string;
  fix: string;
};

const failureModes: FailureMode[] = [
  {
    system: "RAG",
    failure: "Irrelevant retrieval",
    cause: "Weak embeddings or poor chunk boundaries",
    fix: "Tune chunk size, add reranker, evaluate retrieval hit@k weekly",
  },
  {
    system: "Agent",
    failure: "Incorrect tool invocation",
    cause: "Ambiguous tool descriptions and no policy constraints",
    fix: "Add strict tool schema, policy checks, and tool-call simulation tests",
  },
  {
    system: "Inference",
    failure: "Latency spikes",
    cause: "Prompt bloat and missing caching",
    fix: "Trim context, cache deterministic paths, add timeout fallback model",
  },
  {
    system: "Evaluation",
    failure: "Silent quality regressions",
    cause: "No release gate or poor test coverage",
    fix: "Add eval gates in CI and block deploy when quality delta is negative",
  },
];

const evolution = [
  {
    stage: "MVP",
    focus: "Single use case, manual monitoring, fast iteration",
  },
  {
    stage: "Scaling",
    focus: "Caching, queueing, eval automation, basic observability",
  },
  {
    stage: "Production",
    focus: "SLOs, rollback strategy, incident playbooks, cost controls",
  },
];

export function FailureModeExplorer({ sectionId = "failure-mode-explorer" }: { sectionId?: string }) {
  return (
    <SectionCard
      id={sectionId}
      title="Failure Mode Explorer"
      subtitle="Understand how AI systems fail, why they fail, and how to fix them before incidents escalate"
      icon={<AlertTriangle className="size-6" />}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {failureModes.map((item, index) => (
          <motion.article
            key={`${item.system}-${item.failure}`}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.18, delay: index * 0.02 }}
            className="surface-muted p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-md border border-[var(--m3-outline)] px-2 py-1 font-mono text-xs uppercase text-[var(--m3-on-surface-variant)]">
                {item.system}
              </span>
              <Bug className="size-4 text-[var(--m3-on-surface-variant)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--m3-on-surface)]">{item.failure}</h3>
            <p className="mt-2 text-sm text-[var(--m3-on-surface-variant)]">
              <span className="font-semibold text-[var(--m3-on-surface)]">Cause: </span>
              {item.cause}
            </p>
            <p className="mt-2 text-sm text-[var(--m3-on-surface-variant)]">
              <span className="font-semibold text-[var(--m3-on-surface)]">Fix: </span>
              {item.fix}
            </p>
          </motion.article>
        ))}
      </div>

      <div className="section-divider" />

      <div id="architecture-evolution" className="space-y-3">
        <div className="flex items-center gap-2">
          <Wrench className="size-4 text-[var(--m3-on-surface-variant)]" />
          <h3 className="text-lg font-semibold text-[var(--m3-on-surface)]">Architecture Evolution</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {evolution.map((item) => (
            <div key={item.stage} className="surface-muted p-4">
              <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--m3-on-surface-variant)]">{item.stage}</p>
              <p className="mt-2 text-sm leading-6 text-[var(--m3-on-surface-variant)]">{item.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
import React from 'react';

const FailureModeExplorerContent = () => {
  return (
    <div>
      <h2>Failure Mode Explorer</h2>
      <p>This component is designed to help users explore and understand failure modes in complex systems.</p>
    </div>
  );
};

export default FailureModeExplorerContent;
/* Autonomous Groq component update
Autonomous Groq summary: import React from react const FailureModeExplorer return div Failure Mode Explorer This component used explore failure modes. div export default FailureModeExplorer.
*/
