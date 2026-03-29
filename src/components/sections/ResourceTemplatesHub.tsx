import Link from "next/link";
import { FileText, FolderOpen, Library } from "lucide-react";
import { SectionCard } from "@/components/primitives/SectionCard";

const resources = [
  {
    title: "FDE Playbook",
    description: "Documentation for discovery, alignment, delivery, and stakeholder execution.",
    href: "/playbook",
    icon: <FileText className="size-4" />,
  },
  {
    title: "Project Repository",
    description: "300+ project ideas mapped to tools, complexity, and real-world use cases.",
    href: "/repository",
    icon: <FolderOpen className="size-4" />,
  },
  {
    title: "Template Workflows",
    description: "Reusable checklists for interviews, system design, and production readiness reviews.",
    href: "#interview-mode",
    icon: <Library className="size-4" />,
  },
];

export function ResourceTemplatesHub({ sectionId = "resources-templates" }: { sectionId?: string }) {
  return (
    <SectionCard
      id={sectionId}
      title="Resources and Templates"
      subtitle="Fast access to reusable documentation assets and practical implementation guides"
    >
      <div className="grid gap-3 md:grid-cols-3">
        {resources.map((resource) => (
          <Link
            key={resource.title}
            href={resource.href}
            className="surface-muted p-4 transition hover:border-[var(--m3-outline-variant)]"
          >
            <div className="mb-3 flex items-center gap-2 text-[var(--m3-on-surface-variant)]">
              {resource.icon}
              <span className="font-mono text-xs uppercase tracking-[0.08em]">Resource</span>
            </div>
            <h3 className="text-base font-semibold text-[var(--m3-on-surface)]">{resource.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--m3-on-surface-variant)]">{resource.description}</p>
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}
