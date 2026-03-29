import fs from "node:fs/promises";
import path from "node:path";
import { applyDiffPatch, extractTargetFilesFromPatch } from "./fileEditor";
import { commitAndPush, getChangedFiles, rollbackFiles } from "./gitManager";
import { logEvent } from "./logger";
import { planNextChange, type PlanOutput } from "./planner";
import { buildProjectGraph } from "./projectGraph";
import { type AgentMode } from "./prompts";
import { runBuildSafetyChecks, validateNoDuplicateBlocks, validatePatchNotEmpty } from "./validator";

type MemoryState = {
  lastRunAt: string | null;
  history: Array<{
    timestamp: string;
    summary: string;
    files: string[];
    changeType: string;
    qualityScore: number;
  }>;
  dailyCommit: {
    date: string;
    count: number;
    max: number;
  };
};

const MEMORY_PATH = path.join(process.cwd(), "agent", "memory.json");

async function loadMemory(): Promise<MemoryState> {
  const raw = await fs.readFile(MEMORY_PATH, "utf-8");
  return JSON.parse(raw) as MemoryState;
}

async function saveMemory(memory: MemoryState): Promise<void> {
  await fs.writeFile(MEMORY_PATH, `${JSON.stringify(memory, null, 2)}\n`, "utf-8");
}

function pickMode(): AgentMode {
  const r = Math.random();
  if (r < 0.3) return "builder";
  if (r < 0.65) return "optimizer";
  return "editor";
}

function withinDailyCommitLimit(memory: MemoryState): boolean {
  const today = new Date().toISOString().slice(0, 10);
  if (memory.dailyCommit.date !== today) {
    memory.dailyCommit.date = today;
    memory.dailyCommit.count = 0;
  }
  return memory.dailyCommit.count < memory.dailyCommit.max;
}

async function maybeDelay(): Promise<void> {
  if (process.env.AGENT_ENABLE_DELAY !== "true") return;
  const min = 45;
  const max = 120;
  const minutes = Math.floor(Math.random() * (max - min + 1)) + min;
  await logEvent("INFO", "Applying random delay before commit", { minutes });
  await new Promise((resolve) => setTimeout(resolve, minutes * 60 * 1000));
}

function summarizeMemory(memory: MemoryState): string {
  return memory.history
    .slice(-8)
    .map((h) => `${h.timestamp} | ${h.changeType} | q=${h.qualityScore} | ${h.summary}`)
    .join("\n") || "No prior changes recorded.";
}

async function run(): Promise<void> {
  const memory = await loadMemory();
  const graph = await buildProjectGraph();

  if (!withinDailyCommitLimit(memory)) {
    await logEvent("INFO", "Daily commit limit reached, skipping run", memory.dailyCommit);
    return;
  }

  const mode = pickMode();
  const plan: PlanOutput = await planNextChange({
    mode,
    graphSummary: graph.summary,
    memorySummary: summarizeMemory(memory),
    requiredFocus: "AI engineering docs quality, system design UX, API resilience, observability",
  });

  await logEvent("INFO", "Planner decision", {
    mode: plan.mode,
    action: plan.action,
    files: plan.targetFiles,
    qualityScore: plan.qualityScore,
  });

  if (plan.qualityScore < 6) {
    await logEvent("WARN", "Skipped: planner quality score below threshold", { qualityScore: plan.qualityScore });
    return;
  }

  await validatePatchNotEmpty(plan.diffPatch);
  await applyDiffPatch(plan.diffPatch);

  const changedFiles = await getChangedFiles();
  const patchFiles = extractTargetFilesFromPatch(plan.diffPatch);
  const candidateFiles = Array.from(new Set([...changedFiles, ...patchFiles])).filter(Boolean);

  try {
    await validateNoDuplicateBlocks(candidateFiles);
    await runBuildSafetyChecks();
  } catch (error) {
    await rollbackFiles(candidateFiles);
    await logEvent("ERROR", "Validation failed; rolled back patch", {
      error: error instanceof Error ? error.message : String(error),
      files: candidateFiles,
    });
    return;
  }

  await maybeDelay();
  await commitAndPush(plan.commitMessage);

  memory.dailyCommit.count += 1;
  memory.lastRunAt = new Date().toISOString();
  memory.history.push({
    timestamp: memory.lastRunAt,
    summary: plan.summary,
    files: candidateFiles,
    changeType: plan.mode,
    qualityScore: plan.qualityScore,
  });

  if (memory.history.length > 200) {
    memory.history = memory.history.slice(-200);
  }

  await saveMemory(memory);
  await logEvent("INFO", "Agent run successful", {
    commitMessage: plan.commitMessage,
    files: candidateFiles,
  });
}

run().catch(async (error) => {
  await logEvent("ERROR", "Agent run failed", error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
