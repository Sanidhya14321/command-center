import { TopNav } from "@/components/layout/TopNav";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { AIGeneratedContent } from "@/components/sections/AIGeneratedContent";
import { readDailyPayload } from "@/lib/generatedContentCsv";

export const dynamic = "force-dynamic";

export default async function GeneratedContentPage() {
  const { date, payload } = await readDailyPayload();

  return (
    <main className="min-h-screen w-full bg-[var(--m3-surface)]">
      <div className="mx-auto max-w-[1360px] px-4 py-6 md:px-6 lg:py-8">
        <TopNav />

        <div className="mb-6 flex items-center justify-end gap-3 lg:hidden">
          <SidebarNav compact />
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <SidebarNav />
          </aside>

          <div className="min-w-0 space-y-8">
            <AIGeneratedContent sectionId="ai-generated-content" content={payload} dateLabel={date} />
          </div>
        </div>
      </div>
    </main>
  );
}
