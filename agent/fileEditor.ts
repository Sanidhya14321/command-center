import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function runGitApply(patchPath: string): Promise<void> {
  await execFileAsync("git", ["apply", "--check", "--recount", "--unidiff-zero", patchPath], {
    maxBuffer: 1024 * 1024 * 4,
  });

  await execFileAsync("git", ["apply", "--whitespace=nowarn", "--recount", "--unidiff-zero", patchPath], {
    maxBuffer: 1024 * 1024 * 4,
  });
}

function parseMissingPathFromApplyError(message: string): string | null {
  const match = message.match(/error:\s+([^\n:]+):\s+No such file or directory/i);
  return match?.[1]?.trim() || null;
}

function normalizePatch(diffPatch: string): string {
  const stripped = diffPatch
    .replace(/^```diff\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .replace(/\r\n/g, "\n")
    .trim();

  return `${stripped}\n`;
}

export function extractTargetFilesFromPatch(diffPatch: string): string[] {
  const matches = [...diffPatch.matchAll(/^\+\+\+ b\/(.+)$/gm)];
  return Array.from(new Set(matches.map((m) => m[1])));
}

export async function applyDiffPatch(diffPatch: string): Promise<void> {
  const normalizedPatch = normalizePatch(diffPatch);

  if (!normalizedPatch.trim()) {
    throw new Error("Empty diff patch");
  }

  const patchPath = path.join(os.tmpdir(), `autonomous-agent-${Date.now()}.patch`);
  await fs.writeFile(patchPath, normalizedPatch, "utf-8");
  try {
    await runGitApply(patchPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("corrupt patch")) {
      throw new Error(`Planner produced malformed patch: ${message}`);
    }
    if (message.toLowerCase().includes("no such file or directory")) {
      const missingPath = parseMissingPathFromApplyError(message);
      if (missingPath) {
        const absolutePath = path.join(process.cwd(), missingPath);
        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, "", { flag: "a" });

        try {
          await runGitApply(patchPath);
          return;
        } catch (retryError) {
          const retryMessage = retryError instanceof Error ? retryError.message : String(retryError);
          throw new Error(`Planner patch references missing file path: ${retryMessage}`);
        }
      }
      throw new Error(`Planner patch references missing file path: ${message}`);
    }
    throw error;
  } finally {
    await fs.rm(patchPath, { force: true });
  }
}
