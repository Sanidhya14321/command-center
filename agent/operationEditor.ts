import fs from "node:fs/promises";
import path from "node:path";

export type EditOperation =
  | {
      type: "replace_block";
      filePath: string;
      find: string;
      replace: string;
    }
  | {
      type: "append";
      filePath: string;
      content: string;
    }
  | {
      type: "create_file";
      filePath: string;
      content: string;
      overwrite?: boolean;
    };

function normalizePath(filePath: string): string {
  return filePath.replace(/\\/g, "/").replace(/^\/+/, "");
}

function isPathAllowed(filePath: string): boolean {
  return /^(src|docs|agent)\//.test(filePath);
}

function ensureText(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Operation validation failed: ${field} must be a non-empty string`);
  }
  return value;
}

function validateOperation(op: EditOperation): EditOperation {
  if (!op || typeof op !== "object") {
    throw new Error("Operation validation failed: operation must be an object");
  }

  const normalizedFilePath = normalizePath(ensureText((op as { filePath?: unknown }).filePath, "filePath"));
  if (!isPathAllowed(normalizedFilePath)) {
    throw new Error(`Operation validation failed: path not allowed (${normalizedFilePath})`);
  }

  if (op.type === "replace_block") {
    return {
      type: "replace_block",
      filePath: normalizedFilePath,
      find: ensureText((op as { find?: unknown }).find, "find"),
      replace: ensureText((op as { replace?: unknown }).replace, "replace"),
    };
  }

  if (op.type === "append") {
    return {
      type: "append",
      filePath: normalizedFilePath,
      content: ensureText((op as { content?: unknown }).content, "content"),
    };
  }

  if (op.type === "create_file") {
    return {
      type: "create_file",
      filePath: normalizedFilePath,
      content: ensureText((op as { content?: unknown }).content, "content"),
      overwrite: Boolean((op as { overwrite?: unknown }).overwrite),
    };
  }

  throw new Error(`Operation validation failed: unsupported operation type (${String((op as { type?: unknown }).type)})`);
}

function resolveWorkspacePath(relativePath: string): string {
  const root = process.cwd();
  const absolutePath = path.resolve(root, relativePath);
  const rootWithSep = `${root}${path.sep}`;
  if (absolutePath !== root && !absolutePath.startsWith(rootWithSep)) {
    throw new Error(`Operation validation failed: path escapes workspace (${relativePath})`);
  }
  return absolutePath;
}

function normalizeLineForMatch(line: string): string {
  return line.trim().replace(/\s+/g, " ");
}

function tryFuzzyReplaceBlock(current: string, find: string, replace: string): string | null {
  const currentLines = current.split("\n");
  const findLines = find.split("\n");

  if (findLines.length === 0) {
    return null;
  }

  const normalizedFind = findLines.map(normalizeLineForMatch);
  const matchedStarts: number[] = [];

  for (let start = 0; start + findLines.length <= currentLines.length; start += 1) {
    let ok = true;
    for (let offset = 0; offset < findLines.length; offset += 1) {
      if (normalizeLineForMatch(currentLines[start + offset]) !== normalizedFind[offset]) {
        ok = false;
        break;
      }
    }
    if (ok) {
      matchedStarts.push(start);
    }
  }

  if (matchedStarts.length !== 1) {
    return null;
  }

  const start = matchedStarts[0];
  const end = start + findLines.length;
  const replacementLines = replace.split("\n");

  const nextLines = [...currentLines.slice(0, start), ...replacementLines, ...currentLines.slice(end)];
  return nextLines.join("\n");
}

function stripPreviousAutonomousAppendBlocks(content: string): string {
  return content.replace(/\n?\/\* Autonomous Groq component update[\s\S]*?\*\/\n?/g, "\n").trimEnd();
}

function sanitizeForcedTsLikeText(content: string): string {
  const withoutFences = content.replace(/```[\s\S]*?```/g, " ");
  const lines = withoutFences
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => !/^(import|export|const|let|var|return|function|class)\b/i.test(line))
    .filter((line) => !/[{}<>;]/.test(line))
    .slice(0, 5);

  return lines.join("\n").trim();
}

function buildSafeAppendContent(filePath: string, content: string): string {
  const isTsLike = filePath.endsWith(".ts") || filePath.endsWith(".tsx");
  const forcedMode = process.env.AGENT_FORCE_COMPONENT_UPDATE === "true";

  if (!forcedMode || !isTsLike) {
    return content;
  }

  const sanitizedText = sanitizeForcedTsLikeText(content);
  if (!sanitizedText) {
    throw new Error(`Operation failed: append content not safe for forced TS/TSX mode in ${filePath}`);
  }

  const escaped = sanitizedText.replace(/\*\//g, "* /");
  return ["/* Autonomous Groq component update", escaped, "*/"].join("\n");
}

export async function applyOperations(operations: EditOperation[]): Promise<string[]> {
  if (!Array.isArray(operations) || operations.length === 0) {
    throw new Error("Operation validation failed: operations array cannot be empty");
  }

  const validated = operations.slice(0, 2).map(validateOperation);
  const changed = new Set<string>();

  for (const op of validated) {
    const absolutePath = resolveWorkspacePath(op.filePath);
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });

    if (op.type === "replace_block") {
      const current = await fs.readFile(absolutePath, "utf-8");
      let next = "";

      if (current.includes(op.find)) {
        next = current.replace(op.find, op.replace);
      } else {
        const fuzzy = tryFuzzyReplaceBlock(current, op.find, op.replace);
        if (!fuzzy) {
          throw new Error(`Operation failed: find block not found in ${op.filePath}`);
        }
        next = fuzzy;
      }

      if (next === current) {
        throw new Error(`Operation failed: replace produced no changes in ${op.filePath}`);
      }
      await fs.writeFile(absolutePath, next, "utf-8");
      changed.add(op.filePath);
      continue;
    }

    if (op.type === "append") {
      const currentRaw = await fs.readFile(absolutePath, "utf-8").catch(() => "");
      const current = (process.env.AGENT_FORCE_COMPONENT_UPDATE === "true" && (op.filePath.endsWith(".ts") || op.filePath.endsWith(".tsx")))
        ? stripPreviousAutonomousAppendBlocks(currentRaw)
        : currentRaw;
      const separator = current && !current.endsWith("\n") ? "\n" : "";
      const safeContent = buildSafeAppendContent(op.filePath, op.content);
      const next = `${current}${separator}${safeContent.trimEnd()}\n`;
      if (next === current) {
        throw new Error(`Operation failed: append produced no changes in ${op.filePath}`);
      }
      await fs.writeFile(absolutePath, next, "utf-8");
      changed.add(op.filePath);
      continue;
    }

    if (op.type === "create_file") {
      const exists = await fs
        .access(absolutePath)
        .then(() => true)
        .catch(() => false);

      if (exists && !op.overwrite) {
        throw new Error(`Operation failed: file already exists (${op.filePath})`);
      }

      await fs.writeFile(absolutePath, `${op.content.trimEnd()}\n`, "utf-8");
      changed.add(op.filePath);
    }
  }

  return Array.from(changed);
}
