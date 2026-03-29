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
      if (!current.includes(op.find)) {
        throw new Error(`Operation failed: find block not found in ${op.filePath}`);
      }
      const next = current.replace(op.find, op.replace);
      if (next === current) {
        throw new Error(`Operation failed: replace produced no changes in ${op.filePath}`);
      }
      await fs.writeFile(absolutePath, next, "utf-8");
      changed.add(op.filePath);
      continue;
    }

    if (op.type === "append") {
      const current = await fs.readFile(absolutePath, "utf-8").catch(() => "");
      const separator = current && !current.endsWith("\n") ? "\n" : "";
      const next = `${current}${separator}${op.content.trimEnd()}\n`;
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
