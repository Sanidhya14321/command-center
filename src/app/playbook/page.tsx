import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FDEPlaybook } from "@/components/sections/FDEPlaybook";

export default function PlaybookPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-4 py-6 md:px-6 lg:py-8">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] px-4 py-2 text-sm text-[var(--m3-on-surface-variant)]"
      >
        <ArrowLeft className="size-4" />
        Back to command center
      </Link>
      <FDEPlaybook />
    </main>
  );
}
