import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const MODEL = "llama3-70b-8192";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { prompt?: string };
    const prompt = body.prompt?.trim();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        model: MODEL,
        output:
          "Groq key not configured. Add GROQ_API_KEY in your environment to enable live generation.\n\nFallback interview prompts:\n1. Design a retrieval pipeline for low-latency enterprise Q&A.\n2. Explain eval strategy for hallucination regressions.\n3. How would you gate tool calls for safety and compliance?",
      });
    }

    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: MODEL,
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

    const output = completion.choices[0]?.message?.content?.trim();

    return NextResponse.json({
      model: MODEL,
      output: output ?? "No output generated.",
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
