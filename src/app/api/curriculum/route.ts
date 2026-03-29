import { NextResponse } from "next/server";
import { chapters } from "@/data/aiCurriculum";
import { createGroqCompletion, hasGroqApiKey } from "@/lib/groqFallback";

type ChapterExpansion = {
  chapterId: number;
  title: string;
  expandedSummary: string;
  interviewPrompts: string[];
  buildExercise: string;
  gotchas: string[];
};

function fallbackExpansion(chapterId: number): ChapterExpansion {
  const chapter = chapters.find((item) => item.id === chapterId) ?? chapters[0];
  return {
    chapterId: chapter.id,
    title: chapter.title,
    expandedSummary:
      "Master this chapter by combining concept depth with implementation rigor: define metrics first, build a thin end-to-end slice, and iterate with eval feedback before scaling.",
    interviewPrompts: [
      `How would you apply ${chapter.title.toLowerCase()} in a production AI system?`,
      "What failure modes would you watch first and how would you detect them?",
      "Which tradeoff would you prioritize between quality, latency, and cost?",
    ],
    buildExercise:
      "Implement a minimal working prototype, instrument it with traces, then evaluate quality on a fixed test set with pass/fail criteria.",
    gotchas: [
      "Skipping evaluation design until after implementation",
      "Ignoring long-tail edge cases and adversarial prompts",
      "Lack of rollback strategy before production exposure",
    ],
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chapterId = Number(searchParams.get("chapterId") || "1");

  if (!Number.isFinite(chapterId) || chapterId < 1) {
    return NextResponse.json({ error: "Invalid chapterId" }, { status: 400 });
  }

  const chapter = chapters.find((item) => item.id === chapterId);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  if (!hasGroqApiKey()) {
    return NextResponse.json(fallbackExpansion(chapterId));
  }

  try {
    const completion = await createGroqCompletion({
      temperature: 0.25,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an AI engineering curriculum architect. Return compact JSON only with keys: expandedSummary (string), interviewPrompts (array of 3 strings), buildExercise (string), gotchas (array of 3 strings).",
        },
        {
          role: "user",
          content: `Expand this chapter for practical learning from interview prep to deployment readiness:\nTitle: ${chapter.title}\nOutcome: ${chapter.outcome}\nCore Topics: ${chapter.coreTopics.join(", ")}`,
        },
      ],
    });

    const raw = completion.content?.trim() ?? "{}";
    let parsed: {
      expandedSummary?: string;
      interviewPrompts?: string[];
      buildExercise?: string;
      gotchas?: string[];
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(fallbackExpansion(chapterId));
    }

    const payload: ChapterExpansion = {
      chapterId,
      title: chapter.title,
      expandedSummary: parsed.expandedSummary || fallbackExpansion(chapterId).expandedSummary,
      interviewPrompts: parsed.interviewPrompts?.slice(0, 3) || fallbackExpansion(chapterId).interviewPrompts,
      buildExercise: parsed.buildExercise || fallbackExpansion(chapterId).buildExercise,
      gotchas: parsed.gotchas?.slice(0, 3) || fallbackExpansion(chapterId).gotchas,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(fallbackExpansion(chapterId));
  }
}
