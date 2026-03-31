"use client";

import { useMemo, useState } from "react";
import Fuse from "fuse.js";
import { ArrowDownUp, Search } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import { projects } from "@/data/projects";

type SortKey = "id" | "projectName";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 25;

export function ProjectTable({ sectionId = "project-repository" }: { sectionId?: string }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const fuse = useMemo(
    () =>
      new Fuse(projects, {
        keys: ["projectName", "description"],
        threshold: 0.3,
      }),
    [],
  );

  const filtered = useMemo(() => {
    const base = query.trim() ? fuse.search(query).map((res) => res.item) : [...projects];

    base.sort((a, b) => {
      const modifier = sortDirection === "asc" ? 1 : -1;
      if (sortKey === "id") {
        return (a.id - b.id) * modifier;
      }
      return a.projectName.localeCompare(b.projectName) * modifier;
    });

    return base;
  }, [fuse, query, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const currentRangeText = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, filtered.length);
    return `${start}-${end} of ${filtered.length}`;
  }, [filtered.length, page]);

  function onSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection("asc");
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    setPage(1);
  }

  return (
    <SectionCard
      id={sectionId}
      title="Project Repository"
      subtitle="300+ searchable and sortable data science projects for portfolio building and interview prep"
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="relative">
            <span className="sr-only">Search projects</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--m3-on-surface-variant)]" />
            <input
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search by project name or description"
              className="w-full rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] py-2 pl-10 pr-3 text-sm text-[var(--m3-on-surface)] outline-none transition-colors duration-200 focus:border-[var(--m3-primary)]"
            />
          </label>
          <div className="rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] px-3 py-2 text-sm text-[var(--m3-on-surface-variant)]">
            Showing {currentRangeText}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--m3-on-surface-variant)]">
          <span className="rounded-md border border-[var(--m3-outline)]/70 bg-[var(--m3-surface-container-low)] px-2.5 py-1">
            Sort: {sortKey === "id" ? "Serial" : "Project Name"} ({sortDirection.toUpperCase()})
          </span>
          <span className="rounded-md border border-[var(--m3-outline)]/70 bg-[var(--m3-surface-container-low)] px-2.5 py-1">
            Page size: {PAGE_SIZE}
          </span>
        </div>

        <div className="overflow-hidden rounded-md border border-[var(--m3-outline)]">
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b border-[var(--m3-outline)] bg-[var(--m3-surface-container-high)]">
                <tr>
                  <SortableHeader label="Sr. No" active={sortKey === "id"} onClick={() => onSort("id")} />
                  <SortableHeader
                    label="Project Name"
                    active={sortKey === "projectName"}
                    onClick={() => onSort("projectName")}
                  />
                  <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, rowIndex) => (
                  <tr
                    key={item.id}
                    className={`border-t border-[var(--m3-outline)] transition-colors duration-200 hover:bg-[var(--m3-surface-container)] ${
                      rowIndex % 2 === 0 ? "bg-[var(--m3-surface-container-low)]" : "bg-[var(--m3-surface-container)]/55"
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[var(--m3-on-surface-variant)]">{String(item.id).padStart(3, "0")}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--m3-secondary)]">{item.projectName}</td>
                    <td className="px-4 py-3 text-[var(--m3-on-surface-variant)]">{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onPrevious={() => setPage((prev) => Math.max(1, prev - 1))}
          onNext={() => setPage((prev) => Math.min(totalPages, prev + 1))}
        />
      </div>
    </SectionCard>
  );
}

function SortableHeader({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.08em] text-[var(--m3-on-surface-variant)]">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex min-h-[32px] cursor-pointer items-center gap-2 rounded-md px-1 transition-colors duration-200 hover:text-[var(--m3-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]"
      >
        {label}
        <ArrowDownUp className={`size-3 ${active ? "text-[var(--m3-primary)]" : ""}`} />
      </button>
    </th>
  );
}

function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onPrevious}
        disabled={page === 1}
        className="min-h-[40px] cursor-pointer rounded-md border border-[var(--m3-outline)] px-4 py-2 text-sm text-[var(--m3-on-surface-variant)] transition-colors duration-200 hover:bg-[var(--m3-surface-container-low)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-sm text-[var(--m3-on-surface-variant)]">
        Page {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page === totalPages}
        className="min-h-[40px] cursor-pointer rounded-md border border-[var(--m3-outline)] px-4 py-2 text-sm text-[var(--m3-on-surface-variant)] transition-colors duration-200 hover:bg-[var(--m3-surface-container-low)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
