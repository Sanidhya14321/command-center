"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Newspaper, Radar } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import { Badge } from "@/components/primitives/Badge";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";
import { formatRelativeTime } from "@/lib/utils";

type SignalItem = {
  id: string;
  title: string;
  source: string;
  url: string;
  summary: string;
  publishedAt: string;
  relevanceScore: number;
  tags: string[];
  category?: 'Agents' | 'Infra' | 'LLMs' | 'Tools' | 'Evaluation';
  whyItMatters?: string;
};

type FeedResponse = {
  items: SignalItem[];
  generatedAt: string;
};

export function LiveSignalFeed() {
  const [data, setData] = useState<FeedResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error" | "success">("idle");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("loading");
      try {
        const response = await fetch("/api/signals", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load signals");
        }
        const payload = (await response.json()) as FeedResponse;
        if (!cancelled) {
          setData(payload);
          setStatus("success");
        }
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    }

    run();
    const interval = setInterval(run, 1000 * 60 * 6);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const hasItems = useMemo(() => !!data?.items?.length, [data]);

  return (
    <SectionCard
      id="signal-intelligence"
      title="Signal Intelligence"
      subtitle="High-signal AI engineering briefings filtered for deployment, agents, evals, and productization"
      icon={<Radar className="size-6" />}
    >
      <div className="space-y-4">
        {status === "loading" ? <SignalSkeleton /> : null}

        {status === "error" ? (
          <div className="rounded-2xl border border-red-400/35 bg-red-400/10 p-4 text-sm text-red-100">
            Signal feed unavailable. The architecture is resilient and will continue attempting refreshes.
          </div>
        ) : null}

        {status === "success" && hasItems ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--m3-outline)]/50 bg-[var(--m3-surface-container-low)] p-3">
              <div className="text-sm text-[var(--m3-on-surface-variant)]">
                Generated {data?.generatedAt ? formatRelativeTime(data.generatedAt) : "recently"}
              </div>
              <div className="text-xs text-[var(--m3-on-surface-variant)]">
                Pipeline ready for citation graph, deduplication, and ranking upgrades.
              </div>
            </div>
            <div className="grid gap-3">
              {data?.items.map((item, index) => (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-4"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge>{item.source}</Badge>
                    <span className="text-xs text-[var(--m3-on-surface-variant)]">{formatRelativeTime(item.publishedAt)}</span>
                    {item.category && (
                      <Badge className="bg-[var(--m3-primary)]/20 text-[var(--m3-primary)]">
                        {item.category}
                      </Badge>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      <span className="text-xs text-[var(--m3-on-surface-variant)]">Score:</span>
                      <div className="relative h-6 w-16 rounded-full bg-[var(--m3-surface-container-high)]">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.relevanceScore > 80
                              ? 'bg-emerald-500'
                              : item.relevanceScore > 60
                                ? 'bg-yellow-500'
                                : 'bg-orange-500'
                          }`}
                          style={{ width: `${item.relevanceScore}%` }}
                        />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-[var(--m3-on-surface-variant)]">
                          {item.relevanceScore.toFixed(0)}
                        </span>
                      </div>
                    </div>
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[var(--m3-on-surface)] md:text-lg">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--m3-on-surface-variant)]">{item.summary}</p>
                    {item.whyItMatters && (
                      <div className="mt-3 rounded-lg bg-[var(--m3-accent)]/10 border border-[var(--m3-accent)]/30 p-3">
                        <p className="text-xs font-semibold text-[var(--m3-accent)] mb-1">💡 Why this matters:</p>
                        <p className="text-sm text-[var(--m3-on-surface-variant)]">{item.whyItMatters}</p>
                      </div>
                    )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[var(--m3-outline)]/50 px-2 py-1 text-xs text-[var(--m3-on-surface-variant)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--m3-primary)] hover:underline"
                  >
                    <Newspaper className="size-4" />
                    Open source
                  </a>
                </motion.article>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </SectionCard>
  );
}

function SignalSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading signal feed">
      <SkeletonLoader className="h-14 w-full" />
      <SkeletonLoader className="h-32 w-full" />
      <SkeletonLoader className="h-32 w-full" />
      <SkeletonLoader className="h-32 w-full" />
    </div>
  );
}
