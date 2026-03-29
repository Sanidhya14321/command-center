'use client';

import { type ComponentType, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  BarChart3,
  Brain,
  Check,
  Clock3,
  Cog,
  LoaderCircle,
  MessageSquare,
  Search,
  Sparkles,
  Tags,
  TrendingUp,
} from 'lucide-react';

interface StackRecommendation {
  name: string;
  components: string[];
  tradeoffs: string;
  cost: string;
  difficulty: string;
}

interface StackResult {
  recommended: StackRecommendation;
  alternatives: StackRecommendation[];
  thinkingProcess: string;
}

type UseCaseOption = {
  id: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

export function SituationSolutionEngine({ sectionId = 'situation-solution' }: { sectionId?: string }) {
  const [useCase, setUseCase] = useState('');
  const [scale, setScale] = useState('');
  const [latency, setLatency] = useState('');
  const [result, setResult] = useState<StackResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const useCases: UseCaseOption[] = [
    { id: 'chatbot', label: 'Conversational Chatbot', Icon: MessageSquare },
    { id: 'analytics', label: 'Analytics Dashboard', Icon: BarChart3 },
    { id: 'automation', label: 'Process Automation', Icon: Cog },
    { id: 'search', label: 'AI Search/Retrieval', Icon: Search },
    { id: 'classification', label: 'Content Classification', Icon: Tags },
  ];

  const scales = [
    { id: 'small', label: 'Startup/Small (<1K users)', users: '<1K' },
    { id: 'medium', label: 'Growing (1-100K users)', users: '1-100K' },
    { id: 'large', label: 'Large (100K-1M users)', users: '100K-1M' },
    { id: 'enterprise', label: 'Enterprise (1M+ users)', users: '1M+' },
  ];

  const latencies = [
    { id: 'realtime', label: 'Real-time (<100ms)', ms: '<100ms' },
    { id: 'normal', label: 'Normal (100ms-2s)', ms: '100ms-2s' },
    { id: 'batch', label: 'Batch (async, minutes/hours)', ms: 'Async' },
  ];

  const generateStackRecommendation = async () => {
    if (!useCase || !scale || !latency) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/stack-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ useCase, scale, latency }),
      });

      if (!response.ok) {
        throw new Error('Recommendation generation failed');
      }

      const data = (await response.json()) as StackResult;
      setResult(data);
    } catch (error) {
      console.error('Error generating recommendation:', error);
      setError('Unable to generate recommendation right now. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = useCase && scale && latency;
  const selectedUseCase = useCases.find((item) => item.id === useCase);
  const selectedScale = scales.find((item) => item.id === scale);
  const selectedLatency = latencies.find((item) => item.id === latency);

  const thinkingSteps = useMemo(
    () =>
      result?.thinkingProcess
        .split('\n')
        .map((line) => line.replace(/^[\s\-•\d.)]+/, '').trim())
        .filter(Boolean) ?? [],
    [result]
  );

  return (
    <section id={sectionId} className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true }}
        className="rounded-[24px] border border-[var(--m3-outline)]/30 bg-gradient-to-br from-[var(--m3-surface-container-low)] to-[var(--m3-surface-container)] p-6 md:p-8"
      >
        <div className="mb-6 space-y-2">
          <h2 className="flex items-center gap-2 text-2xl font-bold text-[var(--m3-on-surface)]">
            <Sparkles className="size-6 text-[var(--m3-primary)]" />
            Situation to Solution Engine
          </h2>
          <p className="text-sm text-[var(--m3-on-surface-variant)]">
            Describe your constraints. Get the best AI stack with tradeoff analysis.
          </p>
        </div>

        <div className="space-y-6">
          {/* Use Case Selection */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--m3-on-surface)]">
              <Tags className="size-4" />
              What do you need to build?
            </label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {useCases.map((uc) => (
                <button
                  key={uc.id}
                  onClick={() => setUseCase(uc.id)}
                  className={`flex flex-col gap-2 rounded-lg px-4 py-3 text-left text-sm transition ${
                    useCase === uc.id
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                      : 'border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container-high)] hover:border-[var(--m3-primary)]/50'
                  }`}
                >
                  <uc.Icon className="size-4" />
                  <span className="font-semibold">{uc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scale Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--m3-on-surface)]">
              <TrendingUp className="inline w-4 h-4 mr-2" />
              What scale will you operate on?
            </label>
            <div className="space-y-2">
              {scales.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setScale(s.id)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm transition flex justify-between items-center ${
                    scale === s.id
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                      : 'border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container-high)] hover:border-[var(--m3-primary)]/50'
                  }`}
                >
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-xs opacity-70">{s.users}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Latency Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[var(--m3-on-surface)]">
              <Clock3 className="mr-2 inline h-4 w-4" />
              Latency requirement?
            </label>
            <div className="space-y-2">
              {latencies.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLatency(l.id)}
                  className={`w-full rounded-lg px-4 py-3 text-left text-sm transition flex justify-between items-center ${
                    latency === l.id
                      ? 'bg-[var(--m3-primary)] text-[var(--m3-on-primary)]'
                      : 'border border-[var(--m3-outline)]/40 bg-[var(--m3-surface-container-high)] hover:border-[var(--m3-primary)]/50'
                  }`}
                >
                  <span className="font-semibold">{l.label}</span>
                  <span className="text-xs opacity-70">{l.ms}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateStackRecommendation}
            disabled={!isComplete || loading}
            className={`w-full rounded-lg px-4 py-3 font-semibold transition ${
              isComplete && !loading
                ? 'bg-[var(--m3-accent)] text-[var(--m3-on-primary)] hover:shadow-lg'
                : 'bg-[var(--m3-outline-variant)]/30 text-[var(--m3-on-surface-variant)]'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <LoaderCircle className="size-4 animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Generate Stack Recommendation'
            )}
          </button>

          {error ? (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
          ) : null}

          {isComplete ? (
            <div className="flex flex-wrap gap-2 text-xs text-[var(--m3-on-surface-variant)]">
              <span className="rounded-full border border-[var(--m3-outline)] px-2 py-1">Use case: {selectedUseCase?.label}</span>
              <span className="rounded-full border border-[var(--m3-outline)] px-2 py-1">Scale: {selectedScale?.label}</span>
              <span className="rounded-full border border-[var(--m3-outline)] px-2 py-1">Latency: {selectedLatency?.label}</span>
            </div>
          ) : null}
        </div>
      </motion.div>

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* AI Thinking Mode */}
          <motion.div
            className="rounded-[24px] border border-[var(--m3-accent)]/30 bg-[var(--m3-surface-container-high)]/50 p-6"
          >
            <button
              onClick={() => setShowThinking(!showThinking)}
              className="w-full flex items-center justify-between gap-3 hover:opacity-80 transition"
            >
              <div className="flex items-center gap-2">
                <Brain className="size-5 text-[var(--m3-primary)]" />
                <span className="font-semibold text-[var(--m3-on-surface)]">AI Thinking Mode</span>
              </div>
              <span className="text-sm text-[var(--m3-on-surface-variant)]">
                {showThinking ? 'Hide' : 'Show'} reasoning
              </span>
            </button>

            {showThinking && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-4 p-4 bg-[var(--m3-surface-container)] rounded-lg border border-[var(--m3-outline)]/20"
              >
                <ol className="space-y-2 text-sm text-[var(--m3-on-surface-variant)]">
                  {thinkingSteps.length > 0 ? (
                    thinkingSteps.map((step) => (
                      <li
                        key={step}
                        className="rounded-md border border-[var(--m3-outline)]/30 bg-[var(--m3-surface-container-high)] px-3 py-2"
                      >
                        {step}
                      </li>
                    ))
                  ) : (
                    <li className="rounded-md border border-[var(--m3-outline)]/30 bg-[var(--m3-surface-container-high)] px-3 py-2">
                      {result.thinkingProcess}
                    </li>
                  )}
                </ol>
              </motion.div>
            )}
          </motion.div>

          {/* Recommended Stack */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-[24px] border-2 border-[var(--m3-primary)] bg-gradient-to-br from-[var(--m3-surface-container-high)] to-[var(--m3-surface-container)] p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Check className="w-6 h-6 text-[var(--m3-primary)] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--m3-on-surface)]">
                  Recommended: {result.recommended.name}
                </h3>
                <p className="text-sm text-[var(--m3-on-surface-variant)] mt-1">
                  Best for your constraints
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-[var(--m3-on-surface-variant)] uppercase mb-2">
                  Stack Components
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.recommended.components.map((comp, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full bg-[var(--m3-primary)]/20 text-[var(--m3-primary)] text-xs font-semibold"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[var(--m3-surface-container)] rounded-lg">
                  <p className="text-xs text-[var(--m3-on-surface-variant)] mb-1">Cost</p>
                  <p className="font-semibold text-[var(--m3-on-surface)]">{result.recommended.cost}</p>
                </div>
                <div className="p-3 bg-[var(--m3-surface-container)] rounded-lg">
                  <p className="text-xs text-[var(--m3-on-surface-variant)] mb-1">Difficulty</p>
                  <p className="font-semibold text-[var(--m3-on-surface)]">{result.recommended.difficulty}</p>
                </div>
              </div>

              <div className="p-3 bg-[var(--m3-surface-container)] rounded-lg">
                <p className="text-xs font-semibold text-[var(--m3-on-surface-variant)] mb-2">Tradeoffs</p>
                <p className="text-sm text-[var(--m3-on-surface)]">{result.recommended.tradeoffs}</p>
              </div>
            </div>
          </motion.div>

          {/* Alternative Stacks */}
          {result.alternatives.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-[var(--m3-on-surface)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Alternative Approaches
              </p>
              {result.alternatives.map((alt, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="rounded-lg border border-[var(--m3-outline)]/30 bg-[var(--m3-surface-container-high)]/50 p-4"
                >
                  <h4 className="font-semibold text-[var(--m3-on-surface)] mb-3">{alt.name}</h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {alt.components.map((comp, j) => (
                      <span
                        key={j}
                        className="px-2 py-1 rounded text-xs bg-[var(--m3-outline)]/20 text-[var(--m3-on-surface-variant)]"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--m3-on-surface-variant)]">{alt.tradeoffs}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </section>
  );
}
