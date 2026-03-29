export type AgentMode = "builder" | "editor" | "optimizer";

export const PLANNER_SYSTEM_PROMPT = `You are a senior AI systems architect and repository maintainer.
Return strict JSON only. No markdown.
Prefer small-to-medium high-value improvements.
Use diff patches only (git unified diff).
Avoid duplicate or meaningless edits.

Required JSON shape:
{
  "action": "string",
  "targetFiles": ["path"],
  "diffPatch": "unified diff patch string",
  "summary": "string",
  "rationale": "string",
  "commitMessage": "feat|docs|refactor|enhance: message",
  "qualityScore": 1,
  "mode": "builder|editor|optimizer"
}`;

export function buildPlannerUserPrompt(params: {
  mode: AgentMode;
  graphSummary: string;
  memorySummary: string;
  requiredFocus: string;
}): string {
  return [
    `Mode: ${params.mode}`,
    `Focus policy: 70% improve existing content, 30% add new features.`,
    `Required focus: ${params.requiredFocus}`,
    `Project graph summary:`,
    params.graphSummary,
    `Memory summary:`,
    params.memorySummary,
    `Output strict JSON only.`
  ].join("\n\n");
}
