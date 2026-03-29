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
const RECOVERY_HEARTBEAT_PATH = path.join(process.cwd(), ".github", "agent-recovery.log");

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

function isRecoverableAgentError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    message.includes("groq_api_key") ||
    message.includes("decommissioned") ||
    message.includes("not supported") ||
    message.includes("invalid_request_error") ||
    message.includes("planner failed") ||
    message.includes("planner returned empty output") ||
    message.includes("planner did not return unified diff patch") ||
    message.includes("invalid planner json shape") ||
    message.includes("planner produced malformed patch") ||
    message.includes("corrupt patch at line") ||
    message.includes("planner failed to generate a valid patch after retries")
  );
}

async function commitRecoveryHeartbeat(reason: string): Promise<void> {
  if (process.env.GITHUB_ACTIONS !== "true") {
    return;
  }

  await fs.mkdir(path.dirname(RECOVERY_HEARTBEAT_PATH), { recursive: true });
  const timestamp = new Date().toISOString();
  const sanitizedReason = reason.replace(/\s+/g, " ").slice(0, 240);
  await fs.appendFile(RECOVERY_HEARTBEAT_PATH, `${timestamp} | ${sanitizedReason}\n`, "utf-8");

  await commitAndPush("chore(agent): recovery heartbeat after planner failure");
}

async function run(): Promise<void> {
  const memory = await loadMemory();
  const graph = await buildProjectGraph();

  if (!withinDailyCommitLimit(memory)) {
    await logEvent("INFO", "Daily commit limit reached, skipping run", memory.dailyCommit);
    return;
  }

  const mode = pickMode();
  const maxPatchAttempts = 3;
  let plan: PlanOutput | null = null;

  for (let attempt = 1; attempt <= maxPatchAttempts; attempt += 1) {
    const candidatePlan: PlanOutput = await planNextChange({
      mode,
      graphSummary: graph.summary,
      memorySummary: summarizeMemory(memory),
      requiredFocus: "AI engineering docs quality, system design UX, failure mode explorer depth, API resilience, observability",
    });

    await logEvent("INFO", "Planner decision", {
      attempt,
      mode: candidatePlan.mode,
      action: candidatePlan.action,
      files: candidatePlan.targetFiles,
      qualityScore: candidatePlan.qualityScore,
    });

    if (candidatePlan.qualityScore < 6) {
      await logEvent("WARN", "Skipped: planner quality score below threshold", {
        attempt,
        qualityScore: candidatePlan.qualityScore,
      });
      return;
    }

    try {
      await validatePatchNotEmpty(candidatePlan.diffPatch);
      await applyDiffPatch(candidatePlan.diffPatch);
      plan = candidatePlan;
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
      const malformedPatch =
        message.includes("malformed patch") ||
        message.includes("corrupt patch") ||
        message.includes("unified diff patch") ||
        message.includes("patch missing unified diff headers");

      await logEvent("WARN", "Planner patch attempt failed", {
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });

      if (!malformedPatch || attempt === maxPatchAttempts) {
        throw error;
      }
    }
  }

  if (!plan) {
    throw new Error("Planner failed to generate a valid patch after retries");
  }

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
  const message = error instanceof Error ? error.message : String(error);
  await logEvent("ERROR", "Agent run failed", message);
  console.error(`[agent] run failed: ${message}`);

  const strictMode = process.env.AGENT_STRICT_MODE === "true";
  if (strictMode || !isRecoverableAgentError(error)) {
    process.exitCode = 1;
    return;
  }

  try {
    await commitRecoveryHeartbeat(message);
  } catch (heartbeatError) {
    await logEvent("WARN", "Failed to commit recovery heartbeat", {
      error: heartbeatError instanceof Error ? heartbeatError.message : String(heartbeatError),
    });
  }

  console.warn("[agent] Recoverable failure detected; exiting without failing workflow. Set AGENT_STRICT_MODE=true to fail fast.");
  process.exitCode = 0;
});
