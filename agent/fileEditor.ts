import { execFile } from "node:child_process";
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

  await execFileAsync("git", ["apply", "--whitespace=nowarn", "-"], {
    input: diffPatch,
    maxBuffer: 1024 * 1024 * 4,
  });
}
