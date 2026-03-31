import { MessagesSquare } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";

const prompts = [
  "Design an FDE-first architecture for a multi-tenant RAG assistant in a regulated enterprise.",
  "How would you debug a hallucination spike after a retrieval index refresh?",
  "How do you explain model tradeoffs to executives who care about speed, risk, and cost?",
  "What metrics determine if an agent workflow is safe for production rollout?",
];

export function InterviewBlackbook() {
  return (
    <SectionCard
      id="interview-blackbook"
      title="Interview Blackbook"
      subtitle="Scenario drills aligned to C.A.S.E so answers stay structured under pressure"
      icon={<MessagesSquare className="size-6" />}
    >
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        {prompts.map((prompt, index) => (
          <article
            key={prompt}
            className="rounded-lg border border-[var(--m3-outline)]/50 bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container)] hover:border-[var(--m3-outline)]/80 p-4 transition-all hover:shadow-sm"
            role="group"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-xs uppercase tracking-[0.1em] font-semibold bg-[var(--m3-primary)]/12 text-[var(--m3-primary)] px-2.5 py-1.5 rounded-md">
                Case {index + 1}
              </p>
              <span className="text-xs text-[var(--m3-on-surface-variant)] opacity-60">Interview drill</span>
            </div>
            <p className="text-sm leading-6 text-[var(--m3-on-surface-variant)]">{prompt}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
