export type NavItem = {
  id: string;
  label: string;
  href: string;
  description: string;
};

export const primaryNav: NavItem[] = [
  {
    id: "fde-playbook",
    label: "FDE Playbook",
    href: "#fde-playbook",
    description: "Field-ready deployment strategy and consulting execution",
  },
  {
    id: "ai-mastery",
    label: "AI Engineering Mastery",
    href: "#ai-mastery",
    description: "Production-grade LLM systems and architecture playbooks",
  },
  {
    id: "signal-intelligence",
    label: "Signal Intelligence",
    href: "#signal-intelligence",
    description: "Live AI engineering intelligence with relevance scoring",
  },
  {
    id: "interview-blackbook",
    label: "Interview Blackbook",
    href: "#interview-blackbook",
    description: "Practical question banks and response frameworks",
  },
  {
    id: "artifact-templates",
    label: "Artifact Templates",
    href: "#artifact-templates",
    description: "Site survey, WES, SOW, architecture and status assets",
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
];
