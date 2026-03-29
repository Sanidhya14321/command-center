import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export function extractTargetFilesFromPatch(diffPatch: string): string[] {
  const matches = [...diffPatch.matchAll(/^\+\+\+ b\/(.+)$/gm)];
  return Array.from(new Set(matches.map((m) => m[1])));
}

export async function applyDiffPatch(diffPatch: string): Promise<void> {
  if (!diffPatch.trim()) {
    throw new Error("Empty diff patch");
  }

  const patchPath = path.join(os.tmpdir(), `autonomous-agent-${Date.now()}.patch`);
  await fs.writeFile(patchPath, diffPatch, "utf-8");
  try {
    await execFileAsync("git", ["apply", "--whitespace=nowarn", patchPath], {
      maxBuffer: 1024 * 1024 * 4,
    });
  } finally {
    await fs.rm(patchPath, { force: true });
  }
}
