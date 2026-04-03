import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const MODEL = process.env.MODEL || process.env.PRIMARY_MODEL || "auto";

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

function fallbackPayload(): GeneratedContentPayload {
  return {
    headline: "AI Generated Content",
    intro:
      "This panel is designed to continuously summarize what matters next, without repeating content already covered in curriculum, systems, and interview sections.",
    blocks: [
      {
        title: "Execution Focus",
        paragraph:
          "Prioritize one measurable AI delivery objective per sprint, tie it to reliability and latency budgets, and define a rollback trigger before release.",
        callout: "Define success metrics before changing prompts or models.",
      },
      {
        title: "Production Quality",
        paragraph:
          "Run every change through offline evals, canary exposure, and incident playbooks. Optimize for predictable behavior over isolated benchmark wins.",
        callout: "Ship small, observable changes and keep a fast rollback path.",
      },
      {
        title: "Career Signal",
        paragraph:
          "Document architecture decisions with tradeoffs, failure modes, and guardrails. Strong AI engineers communicate system risk and mitigation clearly.",
        callout: "Show your reasoning, not only your implementation.",
      },
    ],
  };
}

export async function GET() {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ model: MODEL, structured: fallbackPayload() });
    }

    const coveredContext = [
      "AI curriculum and learning paths",
      "System design simulator and architecture planning",
      "Failure mode explorer and resilience patterns",
      "Signal intelligence feed and project repository",
      "Interactive interview and agent preparation",
    ].join("; ");

    const styleContext = [
      "Indigo command-center visual language",
      "Short paragraphs and actionable statements",
      "Card-friendly content with title, paragraph, and small callout",
      "Professional, no hype, no markdown",
    ].join("; ");

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.35,
      max_tokens: 900,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate concise website content for an AI engineering command center. Return strict JSON only.",
        },
        {
          role: "user",
          content: `Create fresh section content that avoids overlap with already-covered topics.

Covered content:
${coveredContext}

Style context:
${styleContext}

Return JSON with schema:
{
  "headline": "string",
  "intro": "string",
  "blocks": [
    {
      "title": "string",
      "paragraph": "string",
      "callout": "string"
    }
  ]
}

Constraints:
- Exactly 3 blocks
- Each paragraph max 45 words
- Each callout max 16 words
- Focus on practical execution, architecture clarity, and operational readiness`,
        },
      ],
    });

    const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}") as Partial<GeneratedContentPayload>;
    const fallback = fallbackPayload();

    const safePayload: GeneratedContentPayload = {
      headline: parsed.headline?.trim() || fallback.headline,
      intro: parsed.intro?.trim() || fallback.intro,
      blocks: Array.isArray(parsed.blocks)
        ? parsed.blocks
            .filter((item): item is GeneratedBlock => Boolean(item?.title && item?.paragraph))
            .map((item) => ({
              title: item.title,
              paragraph: item.paragraph,
              callout: item.callout || "",
            }))
            .slice(0, 3)
        : fallback.blocks,
    };

    return NextResponse.json({ model: completion.model, structured: safePayload });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Generated content failed",
        detail: error instanceof Error ? error.message : "Unknown error",
        structured: fallbackPayload(),
      },
      { status: 200 },
    );
  }
}
