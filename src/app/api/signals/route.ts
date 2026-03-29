import { NextResponse } from "next/server";
import { createGroqCompletion, hasGroqApiKey } from "@/lib/groqFallback";

type RawNewsItem = {
  title?: string;
  description?: string;
  url?: string;
  source?: { name?: string };
  publishedAt?: string;
};

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

const KEYWORDS = [
  "ai engineering",
  "llm",
  "agent",
  "rag",
  "evaluation",
  "deployment",
  "inference",
  "tooling",
  "infrastructure",
  "cloud",
  "product",
];

const fallbackSignals: SignalItem[] = [
  {
    id: "fallback-1",
    title: "Enterprises accelerate eval-driven release workflows for LLM products",
    source: "Internal Curated Feed",
    url: "https://example.com/evals-release-workflows",
    summary:
      "Teams are shifting from prompt-only iteration toward eval gates and regression suites to reduce silent quality decay in production assistants.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    relevanceScore: 94,
    tags: ["evals", "deployment", "quality"],
    category: "Evaluation",
    whyItMatters: "Production stability depends on quantified quality gates, not intuition. Evals catch regressions before users do.",
  },
  {
    id: "fallback-2",
    title: "Agent orchestration stacks now prioritize deterministic tool execution layers",
    source: "Internal Curated Feed",
    url: "https://example.com/agent-tooling-layer",
    summary:
      "High-performing agent systems separate planning from tool execution, adding policy checks and telemetry checkpoints before side effects.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    relevanceScore: 89,
    tags: ["agents", "tools", "safety"],
    category: "Agents",
    whyItMatters: "Deterministic tool layers reduce hallucinated API calls and enable observability. This is the difference between demos and production.",
  },
  {
    id: "fallback-3",
    title: "RAG architecture trends move toward hybrid retrieval with reranking",
    source: "Internal Curated Feed",
    url: "https://example.com/rag-hybrid-retrieval",
    summary:
      "Organizations are combining sparse and dense retrieval with rerankers to improve grounding precision while preserving low latency targets.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    relevanceScore: 87,
    tags: ["rag", "retrieval", "infra"],
    category: "Infra",
    whyItMatters: "Hybrid retrieval + reranking achieves 15-30% less hallucination with minimal latency cost. Essential for grounded reasoning at scale.",
  },
];

function relevanceForText(text: string) {
  const lower = text.toLowerCase();
  const hitCount = KEYWORDS.reduce((count, keyword) => (lower.includes(keyword) ? count + 1 : count), 0);
  return Math.min(99, 45 + hitCount * 8);
}

function extractTags(text: string) {
  const lower = text.toLowerCase();
  return KEYWORDS.filter((keyword) => lower.includes(keyword)).slice(0, 4);
}

function categorizeSignal(text: string): SignalItem['category'] {
  const lower = text.toLowerCase();
  if (lower.includes('agent') || lower.includes('orchestr')) return 'Agents';
  if (lower.includes('infra') || lower.includes('deployment') || lower.includes('scaling')) return 'Infra';
  if (lower.includes('llm') || lower.includes('language model') || lower.includes('gpt')) return 'LLMs';
  if (lower.includes('tool') || lower.includes('function calling')) return 'Tools';
  if (lower.includes('eval') || lower.includes('benchmark') || lower.includes('metric')) return 'Evaluation';
  return undefined;
}

async function generateWhyItMatters(title: string, summary: string): Promise<string> {
  if (!hasGroqApiKey()) {
    return 'Analyze this signal to understand its business and technical impact.';
  }

  try {
    const completion = await createGroqCompletion({
      max_tokens: 80,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content: 'Explain why this AI signal matters for production AI systems in one sentence. Focus on immediate impact.',
        },
        {
          role: 'user',
          content: `${title}. ${summary}`,
        },
      ],
    });

    return completion.content || 'Signal relevant for AI engineering practices.';
  } catch {
    return 'Signal relevant for AI engineering practices.';
  }
}
async function summarizeWithGroq(items: SignalItem[]): Promise<SignalItem[]> {
  if (!hasGroqApiKey()) {
    return items;
  }

  const summarized = await Promise.all(
    items.map(async (item) => {
      try {
        const completion = await createGroqCompletion({
          max_tokens: 120,
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "Summarize this headline for senior AI engineers in one concise sentence. Focus on deployment, product impact, or architecture signal.",
            },
            {
              role: "user",
              content: `${item.title}. ${item.summary}`,
            },
          ],
        });

        const summary = completion.content?.trim();
        const whyItMatters = await generateWhyItMatters(item.title, summary || item.summary);
        return {
          ...item,
          summary: summary || item.summary,
          whyItMatters,
        };
      } catch {
        return item;
      }
    }),
  );

  return summarized;
}

export async function GET() {
  try {
    const newsApiKey = process.env.NEWS_API_KEY;
    if (!newsApiKey) {
      return NextResponse.json({
        generatedAt: new Date().toISOString(),
        items: fallbackSignals,
      });
    }

    const query = encodeURIComponent("AI engineering OR LLM OR agents OR RAG OR AI deployment");
    const url = `https://newsapi.org/v2/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`;
    const response = await fetch(url, { next: { revalidate: 300 } });

    if (!response.ok) {
      throw new Error("News source request failed");
    }

    const payload = (await response.json()) as { articles?: RawNewsItem[] };
    const articles = payload.articles ?? [];

    const filtered = articles
      .map((article, index) => {
        const title = article.title?.trim() || "Untitled signal";
        const description = article.description?.trim() || "No description provided.";
        const combined = `${title} ${description}`;
        const relevanceScore = relevanceForText(combined);

        return {
          id: `signal-${index}`,
          title,
          source: article.source?.name || "Unknown source",
          url: article.url || "https://example.com",
          summary: description,
          publishedAt: article.publishedAt || new Date().toISOString(),
          relevanceScore,
          tags: extractTags(combined),
              category: categorizeSignal(combined),
              whyItMatters: undefined,
        } satisfies SignalItem;
      })
      .filter((item) => item.relevanceScore >= 61)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);

    const ranked = filtered.length ? filtered : fallbackSignals;
    const summarized = await summarizeWithGroq(ranked);

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      items: summarized,
    });
  } catch {
    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      items: fallbackSignals,
    });
  }
}
