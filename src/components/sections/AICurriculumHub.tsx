"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  CloudCog,
  Cpu,
  LoaderCircle,
  Rocket,
  Sparkles,
} from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";
import { chapters, deploymentTopics, phaseSummary, type Chapter } from "@/data/aiCurriculum";
import { cn } from "@/lib/utils";

type CurriculumExpansion = {
  chapterId: number;
  title: string;
  expandedSummary: string;
  interviewPrompts: string[];
  buildExercise: string;
  gotchas: string[];
};

const levelColors: Record<Chapter["level"], string> = {
  Foundation: "text-cyan-200 bg-cyan-500/15 border-cyan-400/35",
  Core: "text-emerald-200 bg-emerald-500/15 border-emerald-400/35",
  Advanced: "text-violet-200 bg-violet-500/15 border-violet-400/35",
  Production: "text-amber-200 bg-amber-500/15 border-amber-400/35",
};

export function AICurriculumHub() {
  const [selected, setSelected] = useState<Chapter>(chapters[0]);
  const [expanded, setExpanded] = useState<Record<string, CurriculumExpansion>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coverage = useMemo(() => {
    const foundation = chapters.filter((chapter) => chapter.level === "Foundation").length;
    const core = chapters.filter((chapter) => chapter.level === "Core").length;
    const advanced = chapters.filter((chapter) => chapter.level === "Advanced").length;
    const production = chapters.filter((chapter) => chapter.level === "Production").length;

    return [
      { label: "Foundation", value: foundation, icon: <BookOpen className="size-4" /> },
      { label: "Core", value: core, icon: <BrainCircuit className="size-4" /> },
      { label: "Advanced", value: advanced, icon: <Cpu className="size-4" /> },
      { label: "Production", value: production, icon: <Rocket className="size-4" /> },
    ];
  }, []);

  async function fetchExpansion(chapter: Chapter) {
    if (expanded[chapter.slug]) {
      setSelected(chapter);
      return;
    }

    setSelected(chapter);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/curriculum?chapterId=${chapter.id}`, { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Failed to fetch chapter expansion");
      }

      const payload = (await response.json()) as CurriculumExpansion;
      setExpanded((prev) => ({ ...prev, [chapter.slug]: payload }));
    } catch {
      setError("Could not fetch Groq expansion right now. Showing curated base content.");
    } finally {
      setLoading(false);
    }
  }

  const selectedExpansion = expanded[selected.slug];

  return (
    <SectionCard
      id="ai-curriculum"
      title="AI Engineering Roadmap: Basics to Deployment"
      subtitle="Full-stack learning architecture covering foundations, systems design, retrieval, agents, evals, safety, and production operations"
      icon={<CloudCog className="size-6" />}
    >
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.28 }}
          className="grid gap-3 md:grid-cols-4"
        >
          {coverage.map((item) => (
            <div key={item.label} className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-3">
              <div className="mb-2 flex items-center gap-2 text-[var(--m3-primary)]">
                {item.icon}
                <span className="text-xs uppercase tracking-[0.08em]">{item.label}</span>
              </div>
              <p className="text-2xl font-semibold text-[var(--m3-on-surface)]">{item.value} chapters</p>
            </div>
          ))}
        </motion.div>

        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-3">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--m3-secondary)]">Hands-on LLM Chapter Navigator</h3>
            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {chapters.map((chapter, index) => (
                <motion.button
                  key={chapter.slug}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
                  onClick={() => fetchExpansion(chapter)}
                  className={cn(
                    "w-full rounded-2xl border px-3 py-3 text-left transition",
                    selected.slug === chapter.slug
                      ? "border-[var(--m3-primary)]/60 bg-[var(--m3-primary)]/12"
                      : "border-[var(--m3-outline)]/35 bg-[var(--m3-surface-container)] hover:bg-[var(--m3-surface-container-high)]",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-[var(--m3-on-surface-variant)]">Chapter {chapter.id.toString().padStart(2, "0")}</span>
                    <span className={cn("rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.08em]", levelColors[chapter.level])}>
                      {chapter.level}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-[var(--m3-on-surface)]">{chapter.title}</p>
                </motion.button>
              ))}
            </div>
          </aside>

          <div className="space-y-4">
            <motion.article
              key={selected.slug}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className={cn("rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.08em]", levelColors[selected.level])}>
                  {selected.level}
                </span>
                <h3 className="text-lg font-semibold text-[var(--m3-on-surface)]">{selected.title}</h3>
              </div>
              <p className="text-sm leading-6 text-[var(--m3-on-surface-variant)]">{selected.outcome}</p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <InfoList title="Core Topics" items={selected.coreTopics} icon={<BrainCircuit className="size-4" />} />
                <InfoList title="Deliverables" items={selected.deliverables} icon={<CheckCircle2 className="size-4" />} />
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fetchExpansion(selected)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--m3-primary)] px-4 py-2 text-sm font-semibold text-[var(--m3-on-primary)] disabled:opacity-60"
                >
                  {loading ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  Expand with Groq
                </button>
                <span className="text-xs text-[var(--m3-on-surface-variant)]">Fetches deeper system design + eval guidance</span>
              </div>

              {loading ? (
                <div className="mt-4 space-y-2">
                  <SkeletonLoader className="h-5 w-1/2" />
                  <SkeletonLoader className="h-20 w-full" />
                  <SkeletonLoader className="h-16 w-full" />
                </div>
              ) : null}

              {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}

              {selectedExpansion ? (
                <div className="mt-4 space-y-3 rounded-2xl border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container)] p-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--m3-secondary)]">Groq Deep Dive</h4>
                  <p className="text-sm leading-6 text-[var(--m3-on-surface-variant)]">{selectedExpansion.expandedSummary}</p>
                  <PromptBlock title="Build Exercise" content={selectedExpansion.buildExercise} />
                  <InfoList title="Interview Prompts" items={selectedExpansion.interviewPrompts} icon={<CheckCircle2 className="size-4" />} />
                  <InfoList title="Common Gotchas" items={selectedExpansion.gotchas} icon={<CheckCircle2 className="size-4" />} />
                </div>
              ) : null}
            </motion.article>

            <section id="deployment-blueprint" className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-4">
              <h3 className="mb-3 text-lg font-semibold text-[var(--m3-on-surface)]">Production Blueprint: Deployment and Everything In-Between</h3>
              <div className="grid gap-2 md:grid-cols-2">
                {deploymentTopics.map((topic, index) => (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="rounded-xl border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container)] px-3 py-2 text-sm text-[var(--m3-on-surface-variant)]"
                  >
                    {topic}
                  </motion.div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <section className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-4">
          <h3 className="mb-3 text-lg font-semibold text-[var(--m3-on-surface)]">Learning Progression Visualization</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {phaseSummary.map((phase, index) => (
              <motion.article
                key={phase.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.24, delay: index * 0.04 }}
                className="rounded-2xl border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container)] p-3"
              >
                <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--m3-primary)]">{phase.chapters}</p>
                <h4 className="mt-2 text-base font-semibold text-[var(--m3-on-surface)]">{phase.title}</h4>
                <p className="mt-2 text-sm leading-6 text-[var(--m3-on-surface-variant)]">{phase.focus}</p>
              </motion.article>
            ))}
          </div>
        </section>
      </div>
    </SectionCard>
  );
}

function InfoList({ title, items, icon }: { title: string; items: string[]; icon: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--m3-outline)]/35 bg-[var(--m3-surface-container)] p-3">
      <div className="mb-2 flex items-center gap-2 text-[var(--m3-secondary)]">
        {icon}
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <ul className="space-y-1 text-sm text-[var(--m3-on-surface-variant)]">
        {items.map((item) => (
          <li key={item} className="rounded-lg bg-[var(--m3-surface-container-high)]/45 px-2 py-1.5">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function PromptBlock({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <p className="mb-1 text-xs uppercase tracking-[0.08em] text-[var(--m3-secondary)]">{title}</p>
      <pre className="overflow-x-auto rounded-xl border border-[var(--m3-outline)]/35 bg-[var(--m3-surface-container-low)] p-3 text-xs whitespace-pre-wrap text-[var(--m3-on-surface-variant)]">
        {content}
      </pre>
    </div>
  );
}
