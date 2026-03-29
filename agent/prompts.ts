export type AgentMode = "builder" | "editor" | "optimizer";

export const PLANNER_SYSTEM_PROMPT = `You are a senior AI systems architect and repository maintainer.
Return strict JSON only. No markdown.
Prefer small-to-medium high-value improvements.
Primary output path: operations array for deterministic edits.
Secondary output path: diffPatch (git unified diff) only if operations are not feasible.
When using operations, keep operation count <= 2.
At least one target must be under src/components/.
Do not return no-op suggestions.
When using diffPatch, include file headers (--- a/<path> and +++ b/<path>) and hunk markers (@@ ... @@).
Do not wrap diffPatch in markdown fences.
Avoid duplicate or meaningless edits.

Required JSON shape:
{
  "action": "string",
  "targetFiles": ["path"],
  "operations": [
    {
      "type": "replace_block|append|create_file",
      "filePath": "src/...",
      "find": "required for replace_block",
      "replace": "required for replace_block",
      "content": "required for append/create_file",
      "overwrite": "optional boolean for create_file"
    }
  ],
  "diffPatch": "unified diff patch string (optional fallback)",
  "summary": "string",
  "rationale": "string",
  "commitMessage": "feat|docs|refactor|enhance: message",
  "qualityScore": 1,
  "mode": "builder|editor|optimizer",
  "sourceModel": "string"
}`;

export function buildPlannerUserPrompt(params: {
  mode: AgentMode;
  graphSummary: string;
  memorySummary: string;
  requiredFocus: string;
  candidateFiles: string[];
}): string {
  return [
    `Mode: ${params.mode}`,
    `Focus policy: 70% improve existing content, 30% add new features.`,
    `Required focus: ${params.requiredFocus}`,
    `Hard guard: at least one resulting change must modify a file under src/components/.`,
    `Editable candidate files (prefer these paths):`,
    params.candidateFiles.slice(0, 20).join("\n") || "No candidate files provided",
    `Project graph summary:`,
    params.graphSummary,
    `Memory summary:`,
    params.memorySummary,
    `Output strict JSON only. Prefer operations over diffPatch for reliability. Avoid no-op plans.`
  ].join("\n\n");
}
