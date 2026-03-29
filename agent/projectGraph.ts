import fs from "node:fs/promises";
import path from "node:path";

type GraphNode = {
  path: string;
  kind: "page" | "component" | "api" | "data" | "other";
};

export type ProjectGraph = {
  nodes: GraphNode[];
  summary: string;
  candidateFiles: string[];
};

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(full)));
    } else {
      files.push(full);
    }
  }
  return files;
}

function classify(filePath: string): GraphNode["kind"] {
  if (filePath.includes("/src/app/") && filePath.endsWith("page.tsx")) return "page";
  if (filePath.includes("/src/components/")) return "component";
  if (filePath.includes("/src/app/api/")) return "api";
  if (filePath.includes("/src/data/")) return "data";
  return "other";
}

export async function buildProjectGraph(): Promise<ProjectGraph> {
  const root = process.cwd();
  const srcDir = path.join(root, "src");
  const all = await walk(srcDir);
  const tsLike = all.filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));

  const nodes = tsLike.map((f) => ({
    path: path.relative(root, f).replace(/\\/g, "/"),
    kind: classify(f),
  }));

  const pages = nodes.filter((n) => n.kind === "page").length;
  const components = nodes.filter((n) => n.kind === "component").length;
  const apis = nodes.filter((n) => n.kind === "api").length;

  const candidateFiles = nodes
    .filter((n) => n.kind === "component" || n.kind === "api" || n.kind === "data")
    .slice(0, 30)
    .map((n) => n.path);

  const priorityTargets = [
    "src/components/sections/FailureModeExplorer.tsx",
    "src/components/sections/SystemDesignSimulator.tsx",
    "src/components/sections/InteractiveAgent.tsx",
    "src/components/sections/InterviewModeAgent.tsx",
  ];

  const mergedCandidates = Array.from(new Set([...priorityTargets, ...candidateFiles])).filter((filePath) =>
    nodes.some((n) => n.path === filePath),
  );

  return {
    nodes,
    summary: `pages=${pages}, components=${components}, apis=${apis}, total=${nodes.length}`,
    candidateFiles: mergedCandidates,
  };
}
