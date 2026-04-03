"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";

type GeneratedBlock = {
  title: string;
  paragraph: string;
  callout: string;
};

type GeneratedContentPayload = {
  headline: string;
  intro: string;
  blocks: GeneratedBlock[];
};

type GeneratedResponse = {
  model?: string;
  structured: GeneratedContentPayload;
};

type AIGeneratedContentProps = {
  sectionId?: string;
};

export function AIGeneratedContent({ sectionId = "ai-generated-content" }: AIGeneratedContentProps) {
  const [data, setData] = useState<GeneratedContentPayload | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("loading");
      try {
        const response = await fetch("/api/generated-content", { cache: "no-store" });
        const payload = (await response.json()) as GeneratedResponse;
        if (!cancelled) {
          setData(payload.structured);
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SectionCard
      id={sectionId}
      title="AI Generated Content"
      subtitle="Single-call generated briefing that complements your current command-center modules without repeating them"
      icon={<Sparkles className="size-6" />}
    >
      {status === "loading" ? (
        <div aria-label="Loading AI generated content" className="space-y-3">
          <SkeletonLoader className="h-14 w-full" />
          <SkeletonLoader className="h-28 w-full" />
          <SkeletonLoader className="h-28 w-full" />
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-xl border border-[var(--m3-error)]/35 bg-[var(--m3-error)]/10 p-4 text-sm text-[var(--m3-on-surface)]">
          Could not load generated content right now. Try refreshing this section in a few moments.
        </div>
      ) : null}

      {status === "success" && data ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] p-4">
            <h3 className="text-lg font-semibold text-[var(--m3-on-surface)]">{data.headline}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[var(--m3-on-surface-variant)]">{data.intro}</p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {data.blocks.map((block, index) => (
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
      ) : null}
    </SectionCard>
  );
}
