import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

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
    await execFileAsync("git", ["apply", "--check", "--recount", "--unidiff-zero", patchPath], {
      maxBuffer: 1024 * 1024 * 4,
    });

    await execFileAsync("git", ["apply", "--whitespace=nowarn", "--recount", "--unidiff-zero", patchPath], {
      maxBuffer: 1024 * 1024 * 4,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.toLowerCase().includes("corrupt patch")) {
      throw new Error(`Planner produced malformed patch: ${message}`);
    }
    throw error;
  } finally {
    await fs.rm(patchPath, { force: true });
  }
}
