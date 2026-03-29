import { FileText } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";

const templates = [
  {
    name: "Site Survey",
    points: [
      "Business mission and measurable success criteria",
      "Data systems map and ownership model",
      "Integration risks and dependency gates",
    ],
  },
  {
    name: "WES (Weekly Executive Summary)",
    points: [
      "Outcome highlights and adoption signals",
      "Risk status with mitigation progress",
      "Leadership decisions required this week",
    ],
  },
  {
    name: "SOW (Statement of Work)",
    points: [
      "Scope boundaries and non-goals",
      "Milestone gates and acceptance criteria",
      "Governance cadence, security, and compliance",
    ],
  },
  {
    name: "Mermaid Architecture and ESR",
    points: [
      "Current-state and target-state system diagrams",
      "Executive status report linked to architecture delta",
      "Operational handoff notes for post-deployment teams",
    ],
  },
];

export function ArtifactTemplates() {
  return (
    <SectionCard
      id="artifact-templates"
      title="Artifact Templates"
      subtitle="Reusable deployment artifacts for scoping, architecture, and executive communication"
      icon={<FileText className="size-6" />}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template) => (
          <article
            key={template.name}
            className="rounded-2xl border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-4"
          >
            <h3 className="text-base font-semibold text-[var(--m3-secondary)]">{template.name}</h3>
            <ul className="mt-3 space-y-2 text-sm text-[var(--m3-on-surface-variant)]">
              {template.points.map((point) => (
                <li key={point} className="rounded-xl bg-[var(--m3-surface-container)] px-3 py-2">
                  {point}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
