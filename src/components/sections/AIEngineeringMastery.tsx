import { Braces, ClipboardCheck, ShieldCheck } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import { Callout } from "@/components/primitives/Callout";
import {
  decisionGuide,
  masteryTopics,
  observabilityChecklist,
  productionChecklist,
  safetyChecklist,
} from "@/data/aiMastery";

export function AIEngineeringMastery() {
  return (
    <SectionCard
      id="ai-mastery"
      title="AI Engineering Mastery"
      subtitle="Practical interview-friendly operating handbook for building and shipping real AI systems"
      icon={<Braces className="size-6" />}
    >
      <div className="space-y-6">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {masteryTopics.map((topic) => (
            <div
              key={topic}
              className="rounded-lg border border-[var(--m3-outline)]/50 bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container)] hover:border-[var(--m3-outline)]/80 px-4 py-3 text-sm font-medium text-[var(--m3-on-surface-variant)] transition-all hover:shadow-sm"
              role="option"
              aria-selected="false"
            >
              {topic}
            </div>
          ))}
        </div>

        <Callout title="Model Integration Strategy" variant="info">
          Connect provider SDKs such as Groq through server-side handlers only. Keep API keys in environment variables,
          centralize retries and timeouts, and version prompt templates so model upgrades remain auditable.
        </Callout>

        <Callout title="Memory and Conversation State" variant="success">
          Use session-scoped memory for immediate context, user-level profiles for durable preferences, and retrieval-backed
          long-term memory for domain references. Include pruning policies to limit stale state pollution.
        </Callout>

        <Callout title="Retrieval and Tool Orchestration" variant="warning">
          Treat retrieval as evidence generation and tools as action execution. Route through an explicit planner that can
          decide when to answer directly, call tools, or request clarification based on confidence thresholds.
        </Callout>

        <div className="rounded-2xl border border-[var(--m3-outline)]/50 bg-[var(--m3-surface-container-low)] p-4">
          <h3 className="mb-3 text-lg font-semibold text-[var(--m3-secondary)]">Choosing Prompting vs RAG vs Tools vs Fine-tuning</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border-b border-[var(--m3-outline)]/50 p-2 text-left text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">Scenario</th>
                  <th className="border-b border-[var(--m3-outline)]/50 p-2 text-left text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">Choose</th>
                  <th className="border-b border-[var(--m3-outline)]/50 p-2 text-left text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">Reason</th>
                </tr>
              </thead>
              <tbody>
                {decisionGuide.map((row) => (
                  <tr key={row.scenario}>
                    <td className="border-b border-[var(--m3-outline)]/35 p-2 text-[var(--m3-on-surface-variant)]">{row.scenario}</td>
                    <td className="border-b border-[var(--m3-outline)]/35 p-2 font-medium text-[var(--m3-primary)]">{row.choose}</td>
                    <td className="border-b border-[var(--m3-outline)]/35 p-2 text-[var(--m3-on-surface-variant)]">{row.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <ChecklistCard title="Safety Checklist" icon={<ShieldCheck className="size-5" />} items={safetyChecklist} />
          <ChecklistCard title="Observability Checklist" icon={<ClipboardCheck className="size-5" />} items={observabilityChecklist} />
          <ChecklistCard title="Production Readiness" icon={<ClipboardCheck className="size-5" />} items={productionChecklist} />
        </div>

        <div className="rounded-2xl border border-[var(--m3-outline)]/50 bg-[var(--m3-surface-container-low)] p-4 text-sm leading-6 text-[var(--m3-on-surface-variant)]">
          <h3 className="text-lg font-semibold text-[var(--m3-secondary)]">Evals as a release gate</h3>
          <p className="mt-2">
            Build test sets from real incidents, run offline and online evals, and reject prompt/model releases that regress
            core KPIs like groundedness, format validity, and completion latency.
          </p>
        </div>
      </div>
    </SectionCard>
  );
}

type ChecklistCardProps = {
  title: string;
  icon: React.ReactNode;
  items: string[];
};

function ChecklistCard({ title, icon, items }: ChecklistCardProps) {
  return (
    <article className="rounded-lg border border-[var(--m3-outline)]/50 bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container)] p-4 hover:border-[var(--m3-outline)]/80 transition-all">
      <div className="mb-4 flex items-center gap-2 text-[var(--m3-secondary)]">
        {icon}
        <h4 className="text-sm md:text-base font-semibold">{title}</h4>
      </div>
      <ul className="space-y-2 text-xs md:text-sm text-[var(--m3-on-surface-variant)]" role="list">
        {items.map((item) => (
          <li key={item} className="rounded-md border border-[var(--m3-outline)]/25 bg-[var(--m3-surface-container)] px-3 py-2.5 flex items-start gap-2" role="listitem">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--m3-primary)] mt-1 shrink-0" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
/* Autonomous Groq component update
Autonomous Groq summary: import React from react const AIEngineeringMasteryContent return div Engineering Mastery This section will provide overview engineering best practices. div export default AIEngineeringMasteryContent.
*/
