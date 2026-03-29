import fs from "node:fs/promises";
import path from "node:path";
import { applyDiffPatch, extractTargetFilesFromPatch } from "./fileEditor";
import { commitAndPush, getChangedFiles, rollbackFiles } from "./gitManager";
import { logEvent } from "./logger";
import { applyOperations } from "./operationEditor";
import { planNextChange, repairMalformedPatch, type PlanOutput } from "./planner";
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
    message.includes("planner produced non-applicable patch") ||
    message.includes("corrupt patch at line") ||
    message.includes("patch does not apply") ||
    message.includes("patch failed:") ||
    message.includes("planner patch references missing file path") ||
    message.includes("operation validation failed") ||
    message.includes("operation failed:") ||
    message.includes("no such file or directory") ||
    message.includes("planner failed to generate a valid patch after retries")
  );
}

async function applyResilientFallbackUpdate(params: {
  graphSummary: string;
  memorySummary: string;
  reason: string;
}): Promise<string> {
  const docsDir = path.join(process.cwd(), "docs");
  const docsPath = path.join(docsDir, "autonomous-insights.md");
  await fs.mkdir(docsDir, { recursive: true });

  const timestamp = new Date().toISOString();
  const memoryLines = params.memorySummary
    .split("\n")
    .filter(Boolean)
    .slice(-3)
    .map((line) => `- ${line}`)
    .join("\n");

  const section = [
    `## Autonomous Insight ${timestamp}`,
    "",
    `- Graph summary: ${params.graphSummary}`,
    `- Recovery trigger: ${params.reason.replace(/\s+/g, " ").slice(0, 180)}`,
    "- Reliability action: planner patch retries exhausted; applied deterministic fallback content update.",
    "",
    "### Recent Memory Snapshot",
    memoryLines || "- No memory snapshot available.",
    "",
  ].join("\n");

  let existing = "# Autonomous Insights Log\n\n";
  try {
    existing = await fs.readFile(docsPath, "utf-8");
  } catch {
    // File does not exist yet; will be created.
  }

  await fs.writeFile(docsPath, `${existing.trimEnd()}\n\n${section}`, "utf-8");
  return path.relative(process.cwd(), docsPath).replace(/\\/g, "/");
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
  let operationAppliedFiles: string[] = [];
  let lastPatchError: string | null = null;
  const memorySummary = summarizeMemory(memory);

  for (let attempt = 1; attempt <= maxPatchAttempts; attempt += 1) {
    const candidatePlan: PlanOutput = await planNextChange({
      mode,
      graphSummary: graph.summary,
      memorySummary,
      requiredFocus: "AI engineering docs quality, system design UX, failure mode explorer depth, API resilience, observability",
      candidateFiles: graph.candidateFiles,
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
      lastPatchError = `Planner quality score below threshold (${candidatePlan.qualityScore})`;
      break;
    }

    try {
      if (candidatePlan.operations.length > 0) {
        operationAppliedFiles = await applyOperations(candidatePlan.operations);
      } else {
        await validatePatchNotEmpty(candidatePlan.diffPatch);
        await applyDiffPatch(candidatePlan.diffPatch);
      }

      plan = candidatePlan;
      break;
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : String(error);
      const message = rawMessage.toLowerCase();
      const malformedPatch =
        message.includes("malformed patch") ||
        message.includes("non-applicable patch") ||
        message.includes("corrupt patch") ||
        message.includes("patch does not apply") ||
        message.includes("patch failed:") ||
        message.includes("unified diff patch") ||
        message.includes("patch missing unified diff headers") ||
        message.includes("missing file path") ||
        message.includes("no such file or directory");
      const operationError = message.includes("operation validation failed") || message.includes("operation failed:");

      await logEvent("WARN", "Planner patch attempt failed", {
        attempt,
        error: rawMessage,
      });

      if (malformedPatch && candidatePlan.operations.length === 0) {
        try {
          const repairedPatch = await repairMalformedPatch({
            malformedPatch: candidatePlan.diffPatch,
            applyError: rawMessage,
          });

          await validatePatchNotEmpty(repairedPatch);
          await applyDiffPatch(repairedPatch);

          plan = {
            ...candidatePlan,
            diffPatch: repairedPatch,
          };

          await logEvent("INFO", "Malformed patch repaired successfully", {
            attempt,
            mode: candidatePlan.mode,
            files: candidatePlan.targetFiles,
          });

          break;
        } catch (repairError) {
          await logEvent("WARN", "Patch repair failed", {
            attempt,
            error: repairError instanceof Error ? repairError.message : String(repairError),
          });
        }
      }

      const retryableIssue = malformedPatch || operationError;

      if (!retryableIssue || attempt === maxPatchAttempts) {
        if (!retryableIssue) {
          throw error;
        }

        lastPatchError = rawMessage;
        break;
      }
    }
  }

  if (!plan) {
    const fallbackFile = await applyResilientFallbackUpdate({
      graphSummary: graph.summary,
      memorySummary,
      reason: lastPatchError ?? "Planner failed to generate a valid patch after retries",
    });

    await logEvent("WARN", "Applied resilient fallback update after patch retries", {
      reason: lastPatchError,
      fallbackFile,
    });

    plan = {
      action: "fallback-docs-update",
      targetFiles: [fallbackFile],
      operations: [],
      diffPatch: "",
      summary: "Applied resilient autonomous docs update after patch retry failures.",
      rationale: "Keeps autonomous iteration productive even when model-generated diffs are non-applicable.",
      commitMessage: "docs(agent): resilient autonomous insight update",
      qualityScore: 7,
      mode,
    };
  }

  const changedFiles = await getChangedFiles();
  const patchFiles = plan.diffPatch ? extractTargetFilesFromPatch(plan.diffPatch) : [];
  const candidateFiles = Array.from(new Set([...changedFiles, ...patchFiles, ...operationAppliedFiles])).filter(Boolean);

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
