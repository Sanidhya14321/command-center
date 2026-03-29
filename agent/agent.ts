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

function requireHardOutcome(): boolean {
  return process.env.AGENT_STRICT_MODE === "true" || process.env.AGENT_FORCE_COMPONENT_UPDATE === "true";
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
    message.includes("component guard") ||
    message.includes("did not target any component") ||
    message.includes("no such file or directory") ||
    message.includes("planner failed to generate a valid patch after retries")
  );
}

function isComponentFile(filePath: string): boolean {
  return filePath.replace(/\\/g, "/").startsWith("src/components/");
}

function onlyComponentCandidates(candidateFiles: string[]): string[] {
  const fromGraph = candidateFiles.filter((filePath) => isComponentFile(filePath));
  return fromGraph.slice(0, 20);
}

async function applyForcedComponentRecovery(params: {
  mode: AgentMode;
  graphSummary: string;
  memorySummary: string;
  candidateFiles: string[];
  reason: string;
}): Promise<{ plan: PlanOutput; changedFiles: string[] }> {
  const componentCandidates = onlyComponentCandidates(params.candidateFiles);
  if (!componentCandidates.length) {
    throw new Error("Component guard: no component candidates found for Groq recovery");
  }

  const maxRecoveryAttempts = 3;
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= maxRecoveryAttempts; attempt += 1) {
    try {
      const recoveryPlan = await planNextChange({
        mode: params.mode,
        graphSummary: params.graphSummary,
        memorySummary: params.memorySummary,
        requiredFocus: `Emergency recovery attempt ${attempt}/${maxRecoveryAttempts}: update one existing React component with meaningful AI-engineering content. Trigger: ${params.reason}`,
        candidateFiles: componentCandidates,
        requireComponentTarget: true,
        operationsOnly: true,
        allowedOperationTypes: ["append", "create_file"],
      });

      if (!recoveryPlan.operations.length) {
        throw new Error("Component guard: Groq recovery plan returned no operations");
      }

      const changedFiles = await applyOperations(recoveryPlan.operations);
      if (!changedFiles.some((filePath) => isComponentFile(filePath))) {
        throw new Error("Component guard: Groq recovery did not modify a component file");
      }

      return {
        plan: {
          ...recoveryPlan,
          commitMessage: recoveryPlan.commitMessage || "enhance(component): autonomous Groq recovery update",
        },
        changedFiles,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastError = message;
      await logEvent("WARN", "Forced component recovery attempt failed", {
        attempt,
        error: message,
      });
    }
  }

  throw new Error(`Component guard: forced Groq recovery failed after retries: ${lastError ?? "unknown error"}`);
}

async function run(): Promise<void> {
  const memory = await loadMemory();
  const graph = await buildProjectGraph();
  const hardOutcomeRequired = requireHardOutcome();

  if (!withinDailyCommitLimit(memory) && !hardOutcomeRequired) {
    await logEvent("INFO", "Daily commit limit reached, skipping run", memory.dailyCommit);
    return;
  }

  if (!withinDailyCommitLimit(memory) && hardOutcomeRequired) {
    await logEvent("WARN", "Bypassing daily commit limit due to strict/forced mode", memory.dailyCommit);
  }

  const mode = pickMode();
  const maxPatchAttempts = 3;
  const forceComponentUpdate = process.env.AGENT_FORCE_COMPONENT_UPDATE === "true";
  let plan: PlanOutput | null = null;
  let operationAppliedFiles: string[] = [];
  let lastPatchError: string | null = null;
  const memorySummary = summarizeMemory(memory);

  for (let attempt = 1; attempt <= maxPatchAttempts; attempt += 1) {
    const candidatePlan: PlanOutput = await planNextChange({
      mode,
      graphSummary: graph.summary,
      memorySummary,
      requiredFocus:
        "AI engineering docs quality, system design UX, failure mode explorer depth, API resilience, observability, and concrete component-level upgrades",
      candidateFiles: graph.candidateFiles,
      requireComponentTarget: true,
      operationsOnly: forceComponentUpdate,
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
      // Keep running because the operation or patch may still be valid despite low self-scoring.
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
    await logEvent("WARN", "Primary planning failed; invoking forced Groq component recovery", {
      reason: lastPatchError,
    });

    const recovery = await applyForcedComponentRecovery({
      mode: "editor",
      graphSummary: graph.summary,
      memorySummary,
      candidateFiles: graph.candidateFiles,
      reason: lastPatchError ?? "Planner failed to generate a valid change after retries",
    });

    plan = recovery.plan;
    operationAppliedFiles = recovery.changedFiles;
  }

  let changedFiles = await getChangedFiles();
  let patchFiles = plan.diffPatch ? extractTargetFilesFromPatch(plan.diffPatch) : [];
  let candidateFiles = Array.from(new Set([...changedFiles, ...patchFiles, ...operationAppliedFiles])).filter(Boolean);

  if (!changedFiles.length && hardOutcomeRequired) {
    throw new Error("Component guard: no working tree changes were produced by planner output");
  }

  if (!candidateFiles.some((filePath) => isComponentFile(filePath))) {
    await logEvent("WARN", "Component guard failed after primary apply; rolling back and forcing Groq recovery", {
      files: candidateFiles,
    });

    if (candidateFiles.length) {
      await rollbackFiles(candidateFiles);
    }

    const recovery = await applyForcedComponentRecovery({
      mode: "editor",
      graphSummary: graph.summary,
      memorySummary,
      candidateFiles: graph.candidateFiles,
      reason: "Primary plan did not produce any component file changes",
    });

    plan = recovery.plan;
    operationAppliedFiles = recovery.changedFiles;

    changedFiles = await getChangedFiles();
    patchFiles = [];
    candidateFiles = Array.from(new Set([...changedFiles, ...operationAppliedFiles])).filter(Boolean);
  }

  if (!candidateFiles.some((filePath) => isComponentFile(filePath))) {
    throw new Error("Component guard: no component files were modified by the final plan");
  }

  const runValidation = async (files: string[]): Promise<void> => {
    await validateNoDuplicateBlocks(files);
    await runBuildSafetyChecks();
  };

  try {
    await runValidation(candidateFiles);
  } catch (error) {
    const validationError = error instanceof Error ? error.message : String(error);
    await rollbackFiles(candidateFiles);
    await logEvent("ERROR", "Validation failed; rolled back patch", {
      error: validationError,
      files: candidateFiles,
    });

    if (hardOutcomeRequired) {
      await logEvent("WARN", "Strict mode validation failure; retrying with forced Groq component recovery", {
        error: validationError,
      });

      const recovery = await applyForcedComponentRecovery({
        mode: "editor",
        graphSummary: graph.summary,
        memorySummary,
        candidateFiles: graph.candidateFiles,
        reason: `Validation/build failed after apply: ${validationError}`,
      });

      plan = recovery.plan;
      operationAppliedFiles = recovery.changedFiles;

      const retryChangedFiles = await getChangedFiles();
      const retryCandidateFiles = Array.from(new Set([...retryChangedFiles, ...operationAppliedFiles])).filter(Boolean);

      if (!retryCandidateFiles.some((filePath) => isComponentFile(filePath))) {
        throw new Error("Component guard: recovery retry did not modify any component files");
      }

      try {
        await runValidation(retryCandidateFiles);
      } catch (retryError) {
        const retryMessage = retryError instanceof Error ? retryError.message : String(retryError);
        await rollbackFiles(retryCandidateFiles);
        throw new Error(`Validation failed after forced recovery retry: ${retryMessage}`);
      }

      candidateFiles = retryCandidateFiles;
    } else {
      return;
    }
  }

  await maybeDelay();
  const committed = await commitAndPush(plan.commitMessage);
  if (!committed) {
    await logEvent("WARN", "No commit created after successful apply/validate", {
      files: candidateFiles,
      commitMessage: plan.commitMessage,
    });

    if (hardOutcomeRequired) {
      throw new Error("Autonomous run completed without creating a commit");
    }

    return;
  }

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

  console.warn("[agent] Recoverable failure detected; no fallback commit was created. Set AGENT_STRICT_MODE=true to fail fast.");
  process.exitCode = 0;
});
