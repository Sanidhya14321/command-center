import { NextResponse } from "next/server";
import { createGroqCompletion, hasGroqApiKey } from "@/lib/groqFallback";

const MODEL = process.env.PRIMARY_MODEL || "llama3-70b-8192";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (!hasGroqApiKey()) {
      return NextResponse.json({
        model: MODEL,
        output:
          "Groq key not configured. Add GROQ_API_KEY in your environment to enable live generation.\n\nFallback interview prompts:\n1. Design a retrieval pipeline for low-latency enterprise Q&A.\n2. Explain eval strategy for hallucination regressions.\n3. How would you gate tool calls for safety and compliance?",
      });
    }

    const completion = await createGroqCompletion({
      temperature: 0.4,
      max_tokens: 900,
      messages: [
        {
          role: "system",
          content:
            "You are a senior AI engineering interviewer. Generate high-quality, practical interview questions with concise expected-answer guidance. Keep output clear and structured.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return NextResponse.json({
      model: completion.model,
      output: completion.content ?? "No output generated.",
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
