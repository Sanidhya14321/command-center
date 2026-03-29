import { NextResponse } from "next/server";
import Groq from "groq-sdk";

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
    relevanceScore: 0.94,
    tags: ["evals", "deployment", "quality"],
  },
  {
    id: "fallback-2",
    title: "Agent orchestration stacks now prioritize deterministic tool execution layers",
    source: "Internal Curated Feed",
    url: "https://example.com/agent-tooling-layer",
    summary:
      "High-performing agent systems separate planning from tool execution, adding policy checks and telemetry checkpoints before side effects.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 160).toISOString(),
    relevanceScore: 0.89,
    tags: ["agents", "tools", "safety"],
  },
  {
    id: "fallback-3",
    title: "RAG architecture trends move toward hybrid retrieval with reranking",
    source: "Internal Curated Feed",
    url: "https://example.com/rag-hybrid-retrieval",
    summary:
      "Organizations are combining sparse and dense retrieval with rerankers to improve grounding precision while preserving low latency targets.",
    publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    relevanceScore: 0.87,
    tags: ["rag", "retrieval", "infra"],
  },
];

function relevanceForText(text: string) {
  const lower = text.toLowerCase();
  const hitCount = KEYWORDS.reduce((count, keyword) => (lower.includes(keyword) ? count + 1 : count), 0);
  return Math.min(0.99, 0.45 + hitCount * 0.08);
}

function extractTags(text: string) {
  const lower = text.toLowerCase();
  return KEYWORDS.filter((keyword) => lower.includes(keyword)).slice(0, 4);
}

async function summarizeWithGroq(items: SignalItem[]): Promise<SignalItem[]> {
  if (!process.env.GROQ_API_KEY) {
    return items;
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const summarized = await Promise.all(
    items.map(async (item) => {
      try {
        const completion = await groq.chat.completions.create({
          model: "llama3-70b-8192",
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

        const summary = completion.choices[0]?.message?.content?.trim();
        return {
          ...item,
          summary: summary || item.summary,
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
        } satisfies SignalItem;
      })
      .filter((item) => item.relevanceScore >= 0.61)
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
