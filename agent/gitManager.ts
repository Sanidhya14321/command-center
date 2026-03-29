import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function getChangedFiles(): Promise<string[]> {
  const { stdout } = await execFileAsync("git", ["status", "--short"]);
  return stdout
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(3));
}

export async function rollbackFiles(files: string[]): Promise<void> {
  if (!files.length) return;
  await execFileAsync("git", ["restore", "--", ...files]);
}

export async function commitAndPush(commitMessage: string): Promise<void> {
  await execFileAsync("git", ["add", "-A"]);
  await execFileAsync("git", ["commit", "-m", commitMessage]);
  await execFileAsync("git", ["push"]);
}
