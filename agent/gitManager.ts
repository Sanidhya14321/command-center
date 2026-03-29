import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

function parseStatusPath(line: string): string | null {
  if (!line || line.length < 4) return null;

  const candidate = line.slice(3).trim();
  if (!candidate) return null;

  if (candidate.includes(" -> ")) {
    const parts = candidate.split(" -> ");
    return parts[parts.length - 1]?.trim() || null;
  }

  return candidate;
}

export async function getChangedFiles(): Promise<string[]> {
  const { stdout } = await execFileAsync("git", ["status", "--short"]);
  const files = stdout
    .split("\n")
    .map((line) => parseStatusPath(line))
    .filter(Boolean)
    .map((file) => file as string);

  return Array.from(new Set(files));
}

export async function rollbackFiles(files: string[]): Promise<void> {
  if (!files.length) return;

  const tracked: string[] = [];
  const untracked: string[] = [];

  for (const file of files) {
    try {
      await execFileAsync("git", ["ls-files", "--error-unmatch", "--", file]);
      tracked.push(file);
    } catch {
      untracked.push(file);
    }
  }

  if (tracked.length) {
    await execFileAsync("git", ["restore", "--", ...tracked]);
  }

  if (untracked.length) {
    await execFileAsync("git", ["clean", "-f", "--", ...untracked]);
  }
}

export async function commitAndPush(commitMessage: string): Promise<boolean> {
  const { stdout: stagedBefore } = await execFileAsync("git", ["status", "--porcelain"]);
  if (!stagedBefore.trim()) {
    return false;
  }

  await execFileAsync("git", ["add", "-A"]);
  const { stdout: stagedAfter } = await execFileAsync("git", ["status", "--porcelain"]);
  if (!stagedAfter.trim()) {
    return false;
  }

  await execFileAsync("git", ["commit", "-m", commitMessage]);
  const { stdout: branch } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"]);
  const cleanBranch = branch.trim();
  if (cleanBranch && cleanBranch !== "HEAD") {
    await execFileAsync("git", ["push", "origin", cleanBranch]);
  }

  return true;
}
