import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";

export default function Loading() {
  return (
    <main className="mx-auto max-w-[1600px] space-y-4 px-4 py-6 md:px-6" aria-label="Loading command center">
      <div className="rounded-[24px] border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-4">
        <SkeletonLoader className="h-8 w-64" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <SkeletonLoader className="h-[70vh] w-full" />
        </aside>
        <section className="space-y-4">
          <SkeletonLoader className="h-72 w-full" />
          <SkeletonLoader className="h-96 w-full" />
          <SkeletonLoader className="h-72 w-full" />
        </section>
      </div>
    </main>
  );
}
