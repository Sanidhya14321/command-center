import fs from "node:fs/promises";
import path from "node:path";

export async function logEvent(level: "INFO" | "WARN" | "ERROR", message: string, detail?: unknown): Promise<void> {
  const logDir = path.join(process.cwd(), "agent", "logs");
  const logPath = path.join(logDir, "agent.log");
  await fs.mkdir(logDir, { recursive: true });

  const line = [
    new Date().toISOString(),
    level,
    message,
    detail ? JSON.stringify(detail) : ""
  ].join(" | ");

  await fs.appendFile(logPath, `${line}\n`, "utf-8");
}
