import dynamic from "next/dynamic";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { TopNav } from "@/components/layout/TopNav";
import { CommandCenterHero } from "@/components/sections/CommandCenterHero";
import { AICurriculumHub } from "@/components/sections/AICurriculumHub";
import { LiveSignalFeed } from "@/components/sections/LiveSignalFeed";
import { SkeletonLoader } from "@/components/primitives/SkeletonLoader";

const ProjectTable = dynamic(() => import("@/components/tables/ProjectTable").then((mod) => mod.ProjectTable), {
  loading: () => <SkeletonLoader className="h-72 w-full rounded-md" />,
});

const InteractiveAgent = dynamic(() => import("@/components/sections/InteractiveAgent").then((mod) => mod.InteractiveAgent), {
  loading: () => <SkeletonLoader className="h-72 w-full rounded-md" />,
});

const SituationSolutionEngine = dynamic(
  () => import("@/components/sections/SituationSolutionEngine").then((mod) => mod.SituationSolutionEngine),
  { loading: () => <SkeletonLoader className="h-72 w-full rounded-md" /> },
);

const SystemDesignSimulator = dynamic(
  () => import("@/components/sections/SystemDesignSimulator").then((mod) => mod.SystemDesignSimulator),
  { loading: () => <SkeletonLoader className="h-72 w-full rounded-md" /> },
);

const AIEngineeringMastery = dynamic(
  () => import("@/components/sections/AIEngineeringMastery").then((mod) => mod.AIEngineeringMastery),
  { loading: () => <SkeletonLoader className="h-72 w-full rounded-md" /> },
);

const InterviewModeAgent = dynamic(
  () => import("@/components/sections/InterviewModeAgent").then((mod) => mod.InterviewModeAgent),
  { loading: () => <SkeletonLoader className="h-72 w-full rounded-md" /> },
);

const FailureModeExplorer = dynamic(
  () => import("@/components/sections/FailureModeExplorer").then((mod) => mod.FailureModeExplorer),
  { loading: () => <SkeletonLoader className="h-72 w-full rounded-md" /> },
);

const ResourceTemplatesHub = dynamic(
  () => import("@/components/sections/ResourceTemplatesHub").then((mod) => mod.ResourceTemplatesHub),
  { loading: () => <SkeletonLoader className="h-56 w-full rounded-md" /> },
);

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[var(--m3-surface)]">
      <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-6 lg:py-8">
        <TopNav />

        {/* Mobile-only section navigation */}
        <div className="mb-6 flex items-center justify-end gap-3 lg:hidden">
          <SidebarNav compact />
        </div>

        {/* Main content grid - responsive on all breakpoints */}
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Desktop sidebar - hidden on mobile and tablet */}
          <aside className="hidden lg:block">
            <SidebarNav />
          </aside>

          {/* Main content area */}
          <div className="space-y-8 min-w-0">
            <CommandCenterHero />
            <AICurriculumHub />
            <AIEngineeringMastery />
            <SystemDesignSimulator sectionId="system-simulator" />
            <SituationSolutionEngine sectionId="situation-solution" />
            <FailureModeExplorer sectionId="failure-mode-explorer" />
            <ProjectTable sectionId="project-repository" />
            <LiveSignalFeed />
            <InteractiveAgent />
            <InterviewModeAgent sectionId="interview-mode" />
            <ResourceTemplatesHub sectionId="resources-templates" />
          </div>
        </div>
      </div>
    </main>
  );
}
