import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  type CsvGeneratedRow,
  type GeneratedBlock,
  type GeneratedContentPayload,
  readDailyPayload,
  upsertCsvRow,
  fallbackPayload,
} from "@/lib/generatedContentCsv";

const MODEL = process.env.MODEL || process.env.PRIMARY_MODEL || "auto";

export async function GET() {
  try {
    const result = await readDailyPayload();
    return NextResponse.json({ source: "csv", date: result.date, structured: result.payload });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to read CSV generated content",
        detail: error instanceof Error ? error.message : "Unknown error",
        source: "fallback",
        structured: fallbackPayload(),
      },
      { status: 200 },
    );
  }
}

function toCsvRow(payload: GeneratedContentPayload, date: string): CsvGeneratedRow {
  const [b1, b2, b3] = payload.blocks;
  return {
    date,
    headline: payload.headline,
    intro: payload.intro,
    block1_title: b1?.title ?? "",
    block1_paragraph: b1?.paragraph ?? "",
    block1_callout: b1?.callout ?? "",
    block2_title: b2?.title ?? "",
    block2_paragraph: b2?.paragraph ?? "",
    block2_callout: b2?.callout ?? "",
    block3_title: b3?.title ?? "",
    block3_paragraph: b3?.paragraph ?? "",
    block3_callout: b3?.callout ?? "",
  };
}

export async function POST(request: Request) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "GROQ_API_KEY is required" }, { status: 500 });
    }

    const body = (await request.json().catch(() => ({}))) as { date?: string };
    const targetDate = body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date)
      ? body.date
      : new Date().toISOString().slice(0, 10);

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
          content: `Create fresh section content for date ${targetDate} that avoids overlap with already-covered topics.

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

    const normalizedPayload: GeneratedContentPayload = {
      ...safePayload,
      blocks: [...safePayload.blocks, ...fallback.blocks].slice(0, 3),
    };

    await upsertCsvRow(toCsvRow(normalizedPayload, targetDate));

    return NextResponse.json({
      ok: true,
      source: "groq->csv",
      model: completion.model,
      date: targetDate,
      structured: normalizedPayload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to generate and persist CSV content",
        detail: error instanceof Error ? error.message : "Unknown error",
        structured: fallbackPayload(),
      },
      { status: 500 },
    );
  }
}
