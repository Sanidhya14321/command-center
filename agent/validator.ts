import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function validatePatchNotEmpty(diffPatch: string): Promise<void> {
  const hasGitHeader = diffPatch.includes("diff --git");
  const hasUnifiedHeaders = /^---\s+a\/.+/m.test(diffPatch) && /^\+\+\+\s+b\/.+/m.test(diffPatch);

  if (!hasGitHeader && !hasUnifiedHeaders) {
    throw new Error("Planner did not return unified diff patch");
  }
}

export async function validateNoDuplicateBlocks(files: string[]): Promise<void> {
  for (const file of files) {
    if (!file.endsWith(".ts") && !file.endsWith(".tsx") && !file.endsWith(".md")) continue;
    const content = await fs.readFile(file, "utf-8");
    const lines = content.split("\n").map((l) => l.trim()).filter((l) => l.length > 40);
    const seen = new Set<string>();
    for (const line of lines) {
      if (seen.has(line)) {
        throw new Error(`Duplicate long line detected in ${file}`);
      }
      seen.add(line);
    }
  }
}

export async function runBuildSafetyChecks(): Promise<void> {
  await execFileAsync("npm", ["run", "lint"], { maxBuffer: 1024 * 1024 * 4 });
  await execFileAsync("npm", ["run", "build"], { maxBuffer: 1024 * 1024 * 8 });
}
