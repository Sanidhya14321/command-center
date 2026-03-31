import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FDEPlaybook } from "@/components/sections/FDEPlaybook";

export default function PlaybookPage() {
  return (
    <main className="mx-auto max-w-[1120px] px-4 py-6 md:px-6 lg:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex min-h-[40px] cursor-pointer items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] px-4 py-2 text-sm text-[var(--m3-on-surface-variant)] transition-colors duration-200 hover:bg-[var(--m3-surface-container-high)]"
      >
        <ArrowLeft className="size-4" />
        Back to command center
      </Link>
      <section className="surface-muted mb-6 rounded-xl border border-[var(--m3-outline)]/45 p-5 md:p-6">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-secondary)]">Failure-Defense Library</p>
        <h1 className="mt-2 text-2xl font-semibold text-[var(--m3-on-surface)] md:text-3xl">Failure Mode Explorer Playbook</h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--m3-on-surface-variant)] md:text-base">
          Use structured incident lenses, solution templates, and decision frameworks to prevent recurring AI system failures.
        </p>
      </section>
      <FDEPlaybook />
    </main>
  );
}
