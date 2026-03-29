export type NavItem = {
  id: string;
  label: string;
  href: string;
  description: string;
  kind?: "anchor" | "route";
};

export const primaryNav: NavItem[] = [
  {
    id: "hero",
    label: "Overview",
    href: "#hero",
    kind: "anchor",
    description: "AI engineering command center and learning mission",
  },
  {
    id: "fde-playbook",
    label: "FDE Playbook",
    href: "/playbook",
    kind: "route",
    description: "Forward deployment engineering documentation",
  },
  {
    id: "ai-curriculum",
    label: "AI Engineering",
    href: "#ai-curriculum",
    kind: "anchor",
    description: "Learning paths for prompts, RAG, agents, evals, and deployment",
  },
  {
    id: "system-simulator",
    label: "System Design",
    href: "#system-simulator",
    kind: "anchor",
    description: "Visual architecture builder, bottlenecks, and evolution planning",
  },
  {
    id: "project-repository",
    label: "Project Repository",
    href: "#project-repository",
    kind: "anchor",
    description: "Searchable catalog of 300+ data science and AI projects",
  },
  {
    id: "signal-intelligence",
    label: "Signal Intelligence",
    href: "#signal-intelligence",
    kind: "anchor",
    description: "Relevance-ranked AI ecosystem updates with why-it-matters context",
  },
  {
    id: "agent-lab",
    label: "Agent Lab",
    href: "#agent-lab",
    kind: "anchor",
    description: "Interactive reasoning and interview scenario generation",
  },
  {
    id: "interview-mode",
    label: "Interview Prep",
    href: "#interview-mode",
    kind: "anchor",
    description: "Mock interview flow with scoring and follow-up prompts",
  },
  {
    id: "resources-templates",
    label: "Resources",
    href: "#resources-templates",
    kind: "anchor",
    description: "Reusable templates, guides, and learning assets",
  },
];
