import { SidebarNav } from "@/components/layout/SidebarNav";
import { CommandCenterHero } from "@/components/sections/CommandCenterHero";
import { FDEPlaybook } from "@/components/sections/FDEPlaybook";
import { AIEngineeringMastery } from "@/components/sections/AIEngineeringMastery";
import { LiveSignalFeed } from "@/components/sections/LiveSignalFeed";
import { InterviewBlackbook } from "@/components/sections/InterviewBlackbook";
import { ArtifactTemplates } from "@/components/sections/ArtifactTemplates";
import { ProjectTable } from "@/components/tables/ProjectTable";
import { InteractiveAgent } from "@/components/sections/InteractiveAgent";

export default function Home() {
  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 md:px-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-on-surface-variant)]">
          FDE + AI Engineering Resource Hub
        </p>
        <SidebarNav compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <SidebarNav />
        <div className="space-y-6">
          <CommandCenterHero />
          <FDEPlaybook />
          <AIEngineeringMastery />
          <LiveSignalFeed />
          <InterviewBlackbook />
          <ArtifactTemplates />
          <ProjectTable sectionId="project-repository" />
          <InteractiveAgent />
        </div>
      </div>
    </main>
  );
}
