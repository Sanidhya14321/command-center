"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeHelp, Bot, Building2, GraduationCap, LoaderCircle, Sparkles, Target } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import { promptPresets } from "@/data/promptPresets";

type StructuredQuestion = {
  question: string;
  whatGoodLooksLike: string;
  followUp: string;
};

type StructuredPack = {
  headline: string;
  strategy: string;
  questions: StructuredQuestion[];
};

type AgentResponse = {
  output: string;
  model: string;
  structured?: StructuredPack;
};

export function InteractiveAgent() {
  const [prompt, setPrompt] = useState(promptPresets[0].prompt);
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [status, setStatus] = useState<"idle" | "thinking" | "ready" | "error">("idle");
  const [topic, setTopic] = useState("System design");
  const [level, setLevel] = useState<"junior" | "mid" | "senior">("mid");
  const [companyType, setCompanyType] = useState("Product startup");
  const [questionCount, setQuestionCount] = useState(5);

  const canSubmit = useMemo(() => prompt.trim().length > 8, [prompt]);

  const questionCards = useMemo(() => {
    if (response?.structured?.questions?.length) {
      return response.structured.questions;
    }

    const fallback = response?.output
      .split("\n")
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 8);

    return (fallback ?? []).map((question) => ({
      question,
      whatGoodLooksLike: "Explain architecture, constraints, tradeoffs, and validation strategy.",
      followUp: "What would fail first in production and how would you detect it?",
    }));
  }, [response]);

  async function submitPrompt() {
    setStatus("thinking");
    setResponse(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, topic, level, companyType, questionCount }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      const payload = (await res.json()) as AgentResponse;
      setResponse(payload);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  return (
    <SectionCard
      id="agent-lab"
      title="Agent Lab"
      subtitle="Interactive Groq-powered interview generator for context-aware AI engineering prep"
      icon={<Bot className="size-6" />}
    >
      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="surface-muted p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.1em] text-[var(--m3-on-surface-variant)]">Prompt presets</p>
          <div className="grid gap-2">
            {promptPresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setPrompt(preset.prompt)}
                className="rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2 text-left text-sm text-[var(--m3-on-surface-variant)] transition hover:text-[var(--m3-on-surface)]"
              >
                {preset.label}
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] p-3 text-xs leading-5 text-[var(--m3-on-surface-variant)]">
            Designed to support structured outputs, tool routing, conversation state, eval scoring, and safety policy hooks.
          </div>

          <div className="mt-4 space-y-3 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] p-3">
            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">
              <Target className="mr-1 inline size-3" />
              Topic Context
            </label>
            <input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              className="w-full rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-high)] px-2 py-2 text-xs text-[var(--m3-on-surface)] outline-none focus:border-[var(--m3-primary)]"
            />

            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">
              <GraduationCap className="mr-1 inline size-3" />
              Level
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(["junior", "mid", "senior"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLevel(option)}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium capitalize ${
                    level === option
                      ? "bg-[var(--m3-primary)] text-[var(--m3-on-primary)]"
                      : "border border-[var(--m3-outline)] text-[var(--m3-on-surface-variant)]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">
              <Building2 className="mr-1 inline size-3" />
              Company Style
            </label>
            <input
              value={companyType}
              onChange={(event) => setCompanyType(event.target.value)}
              className="w-full rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-high)] px-2 py-2 text-xs text-[var(--m3-on-surface)] outline-none focus:border-[var(--m3-primary)]"
            />

            <label className="block text-xs font-semibold uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">
              <BadgeHelp className="mr-1 inline size-3" />
              Number Of Questions
            </label>
            <input
              type="range"
              min={3}
              max={8}
              value={questionCount}
              onChange={(event) => setQuestionCount(Number(event.target.value))}
              className="w-full"
            />
            <p className="text-xs text-[var(--m3-on-surface-variant)]">{questionCount} questions</p>
          </div>
        </aside>

        <div className="surface-muted p-4">
          <label htmlFor="agent-prompt" className="text-sm font-semibold text-[var(--m3-secondary)]">
            Prompt
          </label>
          <textarea
            id="agent-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            rows={8}
            className="mt-2 w-full rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] p-3 text-sm text-[var(--m3-on-surface)] outline-none focus:border-[var(--m3-primary)]"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submitPrompt}
              disabled={!canSubmit || status === "thinking"}
              className="inline-flex items-center gap-2 rounded-md border border-[var(--m3-primary)] bg-[var(--m3-primary)] px-4 py-2 text-sm font-semibold text-[var(--m3-on-primary)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === "thinking" ? <LoaderCircle className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              Generate questions
            </button>
            <span className="text-xs text-[var(--m3-on-surface-variant)]">Model: Groq fallback chain (primary to fallback to safe)</span>
          </div>

          <div className="mt-4 min-h-48 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] p-4">
            <AnimatePresence mode="wait">
              {status === "thinking" ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 py-4"
                >
                  <LoaderCircle className="size-4 animate-spin text-[var(--m3-primary)]" />
                  <p className="font-mono text-xs uppercase tracking-[0.1em] text-[var(--m3-on-surface-variant)]">Agent thinking</p>
                </motion.div>
              ) : null}

              {status === "ready" && response ? (
                <motion.div
                  key="ready"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-md border border-[var(--m3-outline)]/60 bg-[var(--m3-surface-container-high)] p-3">
                    <p className="text-sm font-semibold text-[var(--m3-on-surface)]">
                      {response.structured?.headline || "Generated Interview Pack"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--m3-on-surface-variant)]">
                      {response.structured?.strategy || "Use this pack to practice tradeoffs, system reasoning, and production readiness."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {questionCards.map((item, index) => (
                      <div
                        key={`${item.question}-${index}`}
                        className="rounded-md border border-[var(--m3-outline)]/60 bg-[var(--m3-surface-container-high)] p-3"
                      >
                        <p className="text-sm font-semibold text-[var(--m3-on-surface)]">Q{index + 1}. {item.question}</p>
                        <p className="mt-2 text-xs text-[var(--m3-on-surface-variant)]">
                          <span className="font-semibold text-[var(--m3-secondary)]">Strong answer:</span> {item.whatGoodLooksLike}
                        </p>
                        <p className="mt-1 text-xs text-[var(--m3-on-surface-variant)]">
                          <span className="font-semibold text-[var(--m3-secondary)]">Follow-up:</span> {item.followUp}
                        </p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : null}

              {status === "error" ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-red-200"
                >
                  Agent unavailable right now. Retry in a few moments.
                </motion.p>
              ) : null}

              {status === "idle" ? (
                <motion.p
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-[var(--m3-on-surface-variant)]"
                >
                  Start with a preset or custom prompt to generate AI engineering interview questions with architecture-aware detail.
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
