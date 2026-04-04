export type DailyGeneratedBlock = {
  title: string;
  paragraph: string;
  callout: string;
};

export type DailyGeneratedContent = {
  date: string;
  generatedAt: string;
  sourceCsvPath: string;
  headline: string;
  intro: string;
  blocks: DailyGeneratedBlock[];
};

export const dailyGeneratedContent: DailyGeneratedContent = {
  date: "2026-04-04",
  generatedAt: "2026-04-04T00:00:00.000Z",
  sourceCsvPath: "data/ai-engineering-daily-feed.csv",
  headline: "AI Engineering Daily Command Brief",
  intro: "Use this feed to power deterministic daily updates without any LLM calls.",
  blocks: [
    {
      title: "Production Readiness Patterns",
      paragraph:
        "Define SLOs and runbooks for latency error budgets and fallback paths in AI endpoints.",
      callout: "Action: Add one runbook update per incident class.",
    },
    {
      title: "Evaluation Discipline",
      paragraph:
        "Track regression with fixed eval sets and compare prompt/model versions by exact metrics.",
      callout: "Action: Maintain a weekly benchmark snapshot.",
    },
    {
      title: "Cost and Throughput Controls",
      paragraph:
        "Cap max tokens use cached context and add endpoint-specific retry budgets to avoid spend spikes.",
      callout: "Action: Publish daily token spend by endpoint.",
    },
  ],
};
