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
      <div className="grid gap-3 md:grid-cols-2">
        {prompts.map((prompt, index) => (
          <article
            key={prompt}
            className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-4"
          >
            <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--m3-primary)]">Case {index + 1}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--m3-on-surface-variant)]">{prompt}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
