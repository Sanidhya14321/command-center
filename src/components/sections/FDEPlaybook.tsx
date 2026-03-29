"use client";

import { useMemo } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { BookOpenCheck } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";
import { fdePlaybookMarkdown } from "@/data/fdePlaybook";

function slugify(raw: string) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function FDEPlaybook() {
  const headings = useMemo(() => {
    const lines = fdePlaybookMarkdown.split("\n");
    return lines
      .filter((line) => line.startsWith("## "))
      .map((line) => {
        const text = line.replace("## ", "").trim();
        return { text, id: slugify(text) };
      });
  }, []);

  const markdownComponents: Components = {
    h2: ({ children }) => {
      const text = String(children);
      const id = slugify(text);
      return (
        <h2 id={id} className="group mt-10 scroll-mt-28 text-2xl font-semibold text-[var(--m3-primary)]">
          <a href={`#${id}`} className="hover:underline">
            {children}
          </a>
        </h2>
      );
    },
    h3: ({ children }) => <h3 className="mt-6 text-xl font-semibold text-[var(--m3-secondary)]">{children}</h3>,
    p: ({ children }) => <p className="mt-3 text-sm leading-7 text-[var(--m3-on-surface-variant)] md:text-base">{children}</p>,
    li: ({ children }) => <li className="ml-5 list-disc py-1 text-sm text-[var(--m3-on-surface-variant)] md:text-base">{children}</li>,
    code: ({ children, className }) => {
      const isInline = !className;
      if (isInline) {
        return <code className="rounded bg-[var(--m3-surface-container-high)] px-1.5 py-0.5 text-xs text-[var(--m3-primary)]">{children}</code>;
      }

      return (
        <pre className="mt-4 overflow-x-auto rounded-2xl border border-[var(--m3-outline)]/50 bg-[var(--m3-surface-container-lowest)] p-4 text-xs text-[var(--m3-secondary)] md:text-sm">
          <code>{children}</code>
        </pre>
      );
    },
    blockquote: ({ children }) => (
      <blockquote className="mt-5 rounded-2xl border-l-4 border-[var(--m3-primary)] bg-[var(--m3-primary)]/8 px-4 py-3 text-sm italic text-[var(--m3-on-surface)] md:text-base">
        {children}
      </blockquote>
    ),
    table: ({ children }) => (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full border-collapse overflow-hidden rounded-2xl border border-[var(--m3-outline)]/60 text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="bg-[var(--m3-surface-container)] px-3 py-2 text-left text-xs uppercase tracking-[0.08em] text-[var(--m3-secondary)]">{children}</th>,
    td: ({ children }) => <td className="border-t border-[var(--m3-outline)]/40 px-3 py-2 text-[var(--m3-on-surface-variant)]">{children}</td>,
  };

  return (
    <SectionCard
      id="fde-playbook"
      title="FDE Playbook"
      subtitle="Full Awesome Forward Deployment Engineering blueprint rendered as navigable premium documentation"
      icon={<BookOpenCheck className="size-6" />}
    >
      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-28 rounded-2xl border border-[var(--m3-outline)]/50 bg-[var(--m3-surface-container-low)] p-3">
            <p className="mb-2 font-mono text-xs uppercase tracking-[0.1em] text-[var(--m3-on-surface-variant)]">In this section</p>
            <ul className="space-y-1">
              {headings.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="block rounded-lg px-2 py-1.5 text-sm text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-high)] hover:text-[var(--m3-on-surface)]">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <article className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {fdePlaybookMarkdown}
          </ReactMarkdown>
        </article>
      </div>
    </SectionCard>
  );
}
