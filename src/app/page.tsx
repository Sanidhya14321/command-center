import { SidebarNav } from "@/components/layout/SidebarNav";
import { TopNav } from "@/components/layout/TopNav";
import { CommandCenterHero } from "@/components/sections/CommandCenterHero";
import { AICurriculumHub } from "@/components/sections/AICurriculumHub";
import { LiveSignalFeed } from "@/components/sections/LiveSignalFeed";
import { ProjectTable } from "@/components/tables/ProjectTable";
import { InteractiveAgent } from "@/components/sections/InteractiveAgent";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
      <TopNav />

      <div className="mb-4 flex items-center justify-end gap-3">
        <SidebarNav compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav />
        <div className="space-y-6">
          <CommandCenterHero />
          <AICurriculumHub />
          <LiveSignalFeed />
          <ProjectTable sectionId="project-repository" />
          <InteractiveAgent />
        </div>
      </div>
    </main>
  );
}
