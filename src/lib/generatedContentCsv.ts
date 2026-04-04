import fs from "node:fs/promises";
import path from "node:path";

export type GeneratedBlock = {
  title: string;
  paragraph: string;
  callout: string;
};

export type GeneratedContentPayload = {
  headline: string;
  intro: string;
  blocks: GeneratedBlock[];
};

export type CsvGeneratedRow = {
  date: string;
  headline: string;
  intro: string;
  block1_title: string;
  block1_paragraph: string;
  block1_callout: string;
  block2_title: string;
  block2_paragraph: string;
  block2_callout: string;
  block3_title: string;
  block3_paragraph: string;
  block3_callout: string;
};

const REQUIRED_HEADERS: Array<keyof CsvGeneratedRow> = [
  "date",
  "headline",
  "intro",
  "block1_title",
  "block1_paragraph",
  "block1_callout",
  "block2_title",
  "block2_paragraph",
  "block2_callout",
  "block3_title",
  "block3_paragraph",
  "block3_callout",
];

export const CSV_RELATIVE_PATH = "data/ai-engineering-daily-feed.csv";

export function fallbackPayload(): GeneratedContentPayload {
  return {
    headline: "AI Engineering Daily Brief",
    intro: "CSV-backed daily content for AI engineering execution and systems thinking.",
    blocks: [
      {
        title: "Execution Focus",
        paragraph: "Define one measurable AI delivery objective and tie it to reliability, latency, and rollback criteria.",
        callout: "Set explicit success metrics before shipping changes.",
      },
      {
        title: "Evaluation Discipline",
        paragraph: "Track regressions with stable eval sets and compare prompt/model changes using deterministic scorecards.",
        callout: "Keep a weekly eval baseline and drift report.",
      },
      {
        title: "Operational Readiness",
        paragraph: "Document failure modes, fallback paths, and incident playbooks for every critical AI endpoint.",
        callout: "Run one resilience drill each sprint.",
      },
    ],
  };
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];

    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === "," && !inQuotes) {
      out.push(current.trim());
      current = "";
      continue;
    }

    current += ch;
  }

  out.push(current.trim());
  return out;
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function rowToPayload(row: CsvGeneratedRow): GeneratedContentPayload {
  return {
    headline: row.headline,
    intro: row.intro,
    blocks: [
      {
        title: row.block1_title,
        paragraph: row.block1_paragraph,
        callout: row.block1_callout,
      },
      {
        title: row.block2_title,
        paragraph: row.block2_paragraph,
        callout: row.block2_callout,
      },
      {
        title: row.block3_title,
        paragraph: row.block3_paragraph,
        callout: row.block3_callout,
      },
    ],
  };
}

function parseCsvRows(content: string): CsvGeneratedRow[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]);
  const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length > 0) {
    throw new Error(`CSV missing required columns: ${missing.join(", ")}`);
  }

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const base: Partial<CsvGeneratedRow> = {};

    headers.forEach((header, index) => {
      if (REQUIRED_HEADERS.includes(header as keyof CsvGeneratedRow)) {
        (base as Record<string, string>)[header] = values[index] ?? "";
      }
    });

    return base as CsvGeneratedRow;
  });
}

function serializeCsv(rows: CsvGeneratedRow[]): string {
  const headerLine = REQUIRED_HEADERS.join(",");
  const dataLines = rows.map((row) => REQUIRED_HEADERS.map((h) => csvEscape(row[h] ?? "")).join(","));
  return [headerLine, ...dataLines].join("\n") + "\n";
}

async function readRows(csvRelativePath: string = CSV_RELATIVE_PATH): Promise<CsvGeneratedRow[]> {
  const fullPath = path.join(process.cwd(), csvRelativePath);

  try {
    const raw = await fs.readFile(fullPath, "utf-8");
    return parseCsvRows(raw);
  } catch {
    return [];
  }
}

export async function readDailyPayload(csvRelativePath: string = CSV_RELATIVE_PATH): Promise<{ date: string; payload: GeneratedContentPayload }> {
  const rows = await readRows(csvRelativePath);
  if (!rows.length) {
    return { date: todayIsoDate(), payload: fallbackPayload() };
  }

  const today = todayIsoDate();
  const todayRow = rows.find((row) => row.date === today);
  const chosen = todayRow ?? rows[Math.floor(Date.now() / 86_400_000) % rows.length];
  return { date: chosen.date || today, payload: rowToPayload(chosen) };
}

export async function upsertCsvRow(row: CsvGeneratedRow, csvRelativePath: string = CSV_RELATIVE_PATH): Promise<void> {
  const fullPath = path.join(process.cwd(), csvRelativePath);
  const rows = await readRows(csvRelativePath);
  const nextRows = [...rows];

  const index = nextRows.findIndex((entry) => entry.date === row.date);
  if (index >= 0) {
    nextRows[index] = row;
  } else {
    nextRows.push(row);
    nextRows.sort((a, b) => a.date.localeCompare(b.date));
  }

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, serializeCsv(nextRows), "utf-8");
}
