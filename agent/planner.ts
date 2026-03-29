import Groq from "groq-sdk";
import { buildPlannerUserPrompt, PLANNER_SYSTEM_PROMPT, type AgentMode } from "./prompts";

export type PlanOutput = {
  action: string;
  targetFiles: string[];
  diffPatch: string;
  summary: string;
  rationale: string;
  commitMessage: string;
  qualityScore: number;
  mode: AgentMode;
};

const PRIMARY_MODEL = process.env.MODEL || process.env.PRIMARY_MODEL || "auto";
const FALLBACK_MODEL = process.env.FALLBACK_MODEL || "llama-3.3-70b-versatile";
const SAFE_MODEL = process.env.SAFE_MODEL || "mixtral-8x7b-32768";
const MODEL_CHAIN = Array.from(new Set([PRIMARY_MODEL, FALLBACK_MODEL, SAFE_MODEL]));

function parsePlan(content: string): PlanOutput {
  const parsed = JSON.parse(content) as PlanOutput;
  if (!parsed.action || !Array.isArray(parsed.targetFiles) || !parsed.diffPatch) {
    throw new Error("Invalid planner JSON shape");
  }
  return parsed;
}

function shouldRetry(error: unknown): boolean {
  const msg = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return msg.includes("decommissioned") || msg.includes("not supported") || msg.includes("invalid_request_error");
}

export async function planNextChange(params: {
  mode: AgentMode;
  graphSummary: string;
  memorySummary: string;
  requiredFocus: string;
}): Promise<PlanOutput> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is required for autonomous planner");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const userPrompt = buildPlannerUserPrompt(params);
  let lastError: unknown;

  for (const model of MODEL_CHAIN) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PLANNER_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("Planner returned empty output");
      }

      return parsePlan(content);
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error)) break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Planner failed for all fallback models");
}
