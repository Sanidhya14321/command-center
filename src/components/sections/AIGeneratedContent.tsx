"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import type { GeneratedContentPayload } from "@/lib/generatedContentCsv";

type AIGeneratedContentProps = {
  content: GeneratedContentPayload;
  dateLabel: string;
  sectionId?: string;
};

export function AIGeneratedContent({ content, dateLabel, sectionId = "ai-generated-content" }: AIGeneratedContentProps) {
  return (
    <SectionCard
      id={sectionId}
      title="AI Generated Content"
      subtitle={`Daily CSV-backed briefing (${dateLabel})`}
      icon={<Sparkles className="size-6" />}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] p-4">
          <h3 className="text-lg font-semibold text-[var(--m3-on-surface)]">{content.headline}</h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">{content.intro}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {content.blocks.map((block, index) => (
            <motion.article
              key={`${block.title}-${index}`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="rounded-xl border border-[var(--m3-outline)]/60 bg-[var(--m3-surface-container)] p-4"
              role="article"
              aria-label={block.title}
            >
              <h4 className="text-sm font-semibold text-[var(--m3-on-surface)] md:text-base">{block.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">{block.paragraph}</p>
              <div className="mt-3 rounded-md border border-[var(--m3-primary)]/35 bg-[var(--m3-primary)]/10 px-3 py-2 text-xs font-medium text-[var(--m3-primary)]">
                {block.callout}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
