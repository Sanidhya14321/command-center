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

function sanitizePatch(rawPatch: string): string {
  const trimmed = rawPatch.trim();
  const withoutFence = trimmed.replace(/^```(?:diff)?\s*/i, "").replace(/```$/i, "").trim();
  return withoutFence;
}

function hasUnifiedHeaders(patch: string): boolean {
  return patch.includes("diff --git") || (/^---\s+a\/.+/m.test(patch) && /^\+\+\+\s+b\/.+/m.test(patch));
}

function extractPatchFromText(text: string): string {
  const normalized = sanitizePatch(text);

  const diffIndex = normalized.indexOf("diff --git");
  if (diffIndex >= 0) {
    return normalized.slice(diffIndex).trim();
  }

  const unifiedIndex = normalized.search(/^---\s+a\//m);
  if (unifiedIndex >= 0) {
    return normalized.slice(unifiedIndex).trim();
  }

  return normalized;
}

function parsePlan(content: string): PlanOutput {
  const parsed = JSON.parse(content) as PlanOutput;
  if (!parsed.action || !Array.isArray(parsed.targetFiles) || !parsed.diffPatch) {
    throw new Error("Invalid planner JSON shape");
  }

  const cleanPatch = sanitizePatch(parsed.diffPatch);
  if (!hasUnifiedHeaders(cleanPatch)) {
    throw new Error("Planner patch missing unified diff headers");
  }

  return {
    ...parsed,
    diffPatch: cleanPatch,
  };
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
      const strictPrompt = `${userPrompt}\n\nCritical output rule: diffPatch must be a valid git unified diff patch with file headers (--- a/<path> and +++ b/<path>). Do not use markdown code fences.`;
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.2,
        max_tokens: 1400,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: PLANNER_SYSTEM_PROMPT },
          { role: "user", content: strictPrompt },
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

export async function repairMalformedPatch(params: {
  malformedPatch: string;
  applyError: string;
}): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is required for patch repair");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const prompt = [
    "Repair the malformed git patch below.",
    "Return only a valid unified diff patch.",
    "Requirements:",
    "- No markdown fences",
    "- Must include --- a/<path> and +++ b/<path>",
    "- Must include proper @@ hunks",
    "- If the target file does not exist, convert patch to a file-creation patch using --- /dev/null and +++ b/<path>",
    "- Ensure parent directories can be created by git apply",
    "- Preserve intended changes",
    "Apply error:",
    params.applyError,
    "Malformed patch input:",
    params.malformedPatch,
  ].join("\n\n");

  let lastError: unknown;

  for (const model of MODEL_CHAIN) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0,
        max_tokens: 1800,
        messages: [
          {
            role: "system",
            content:
              "You are a patch repair assistant. Output only a valid git unified diff patch with no commentary.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("Patch repair returned empty output");
      }

      const repairedPatch = extractPatchFromText(content);
      if (!hasUnifiedHeaders(repairedPatch)) {
        throw new Error("Patch repair did not return unified diff headers");
      }

      return repairedPatch;
    } catch (error) {
      lastError = error;
      if (!shouldRetry(error)) break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Failed to repair malformed patch");
}
