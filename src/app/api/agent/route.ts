import { NextResponse } from "next/server";
import { createGroqCompletion, hasGroqApiKey } from "@/lib/groqFallback";

const MODEL = process.env.MODEL || process.env.PRIMARY_MODEL || "auto";

type AgentRequest = {
  prompt?: string;
  topic?: string;
  level?: "junior" | "mid" | "senior";
  companyType?: string;
  questionCount?: number;
};

type StructuredQuestion = {
  question: string;
  whatGoodLooksLike: string;
  followUp: string;
};

type AgentPayload = {
  headline: string;
  strategy: string;
  questions: StructuredQuestion[];
};

function fallbackPayload(): AgentPayload {
  return {
    headline: "Fallback Interview Set",
    strategy: "Use these to practice architecture tradeoffs, reliability, and evaluation depth.",
    questions: [
      {
        question: "Design a retrieval pipeline for low-latency enterprise Q&A with strict access control.",
        whatGoodLooksLike:
          "Covers indexing, chunking, hybrid retrieval, ACL filtering, caching, and fallback behavior.",
        followUp: "How would you test retrieval quality regressions before release?",
      },
      {
        question: "Explain an eval strategy to catch hallucination regressions in production.",
        whatGoodLooksLike:
          "Defines offline + online metrics, golden sets, automated checks, and rollback thresholds.",
        followUp: "What signals should trigger an automatic rollback?",
      },
      {
        question: "How would you gate tool calls in an agent for safety and compliance?",
        whatGoodLooksLike:
          "Details policy checks, argument validation, sandboxing, audit logs, and denied-action responses.",
        followUp: "Where do you enforce least privilege in this system?",
      },
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AgentRequest;
    const prompt = body.prompt?.trim();
    const topic = body.topic?.trim() || "AI engineering";
    const level = body.level || "mid";
    const companyType = body.companyType?.trim() || "product company";
    const questionCount = Math.min(Math.max(body.questionCount ?? 5, 3), 8);

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!hasGroqApiKey()) {
      const fallback = fallbackPayload();
      return NextResponse.json({
        model: MODEL,
        output: fallback.questions.map((item, index) => `${index + 1}. ${item.question}`).join("\n"),
        structured: fallback,
      });
    }

    const completion = await createGroqCompletion({
      temperature: 0.35,
      max_tokens: 1200,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior AI engineering interviewer. Generate practical, context-aware interview prep sets. Return valid JSON only.",
        },
        {
          role: "user",
          content: `Create an interview prep set using this request and context.

Candidate context:
- Target topic: ${topic}
- Seniority: ${level}
- Company type: ${companyType}
- Requested count: ${questionCount}

User prompt: ${prompt}

Return JSON with schema:
{
  "headline": "short title",
  "strategy": "2-3 sentence interview strategy",
  "questions": [
    {
      "question": "question text",
      "whatGoodLooksLike": "what a strong answer should include",
      "followUp": "probing follow-up"
    }
  ]
}

Requirements:
- Questions must be scenario-based and architecture-relevant.
- Include reliability, observability, and tradeoff reasoning where possible.
- Keep wording precise and interviewer-grade.`,
        },
      ],
    });

    const parsed = JSON.parse(completion.content) as Partial<AgentPayload>;
    const safePayload: AgentPayload = {
      headline: parsed.headline?.trim() || "AI Engineering Interview Pack",
      strategy: parsed.strategy?.trim() || "Focus on decision quality, tradeoff clarity, and production constraints.",
      questions: Array.isArray(parsed.questions)
        ? parsed.questions
            .filter((item): item is StructuredQuestion => Boolean(item?.question))
            .map((item) => ({
              question: item.question,
              whatGoodLooksLike: item.whatGoodLooksLike || "Explain architecture, tradeoffs, and validation approach.",
              followUp: item.followUp || "What would you measure in production to validate your approach?",
            }))
            .slice(0, questionCount)
        : fallbackPayload().questions,
    };

    return NextResponse.json({
      model: completion.model,
      output: safePayload.questions.map((item, index) => `${index + 1}. ${item.question}`).join("\n"),
      structured: safePayload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Agent generation failed",
        detail: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
