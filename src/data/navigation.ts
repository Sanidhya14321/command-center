export type NavItem = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export const primaryNav: NavItem[] = [
  {
    id: "hero",
    label: "Overview",
    href: "#hero",
    description: "AI engineering command center and learning mission",
  },
  {
    id: "ai-curriculum",
    label: "AI Curriculum",
    href: "#ai-curriculum",
    description: "Complete chapter progression from fundamentals to deployment",
  },
    {
      id: "situation-solution",
      label: "Solution Engine",
      href: "#situation-solution",
      description: "Stack recommendations based on use case, scale, and latency",
    },
    {
      id: "system-simulator",
      label: "System Simulator",
      href: "#system-simulator",
      description: "Drag & drop architecture builder with bottleneck analysis",
    },
  {
    id: "signal-intelligence",
    label: "Signal Intelligence",
    href: "#signal-intelligence",
    description: "Live AI engineering intelligence with relevance scoring",
  },
  {
    id: "deployment-blueprint",
    label: "Deployment",
    href: "#deployment-blueprint",
    description: "Production readiness, observability, and release operations",
  },
  {
    id: "project-repository",
    label: "Project Repository",
    href: "#project-repository",
    description: "Searchable catalog of 300+ data science projects",
  },
  {
    id: "agent-lab",
    label: "Agent Lab",
    href: "#agent-lab",
    description: "Interactive interview generator powered by Groq",
  },
    {
      id: "interview-mode",
      label: "Interview Mode",
      href: "#interview-mode",
      description: "Mock interviewer with real-time feedback and scoring",
    },
];
