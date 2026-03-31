import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  id?: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function SectionCard({ id, title, subtitle, icon, children, className }: SectionCardProps) {
  return (
    <section
      id={id}
      className={cn(
        "surface scroll-mt-24 p-6 md:p-8",
        className,
      )}
    >
      <header className="mb-6 flex items-start justify-between gap-4 border-b border-[var(--m3-outline)] pb-4">
        <div>
          <h2 className="font-display text-2xl tracking-tight text-[var(--m3-on-surface)] md:text-3xl">{title}</h2>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--m3-on-surface-variant)] md:text-base">{subtitle}</p>
          ) : null}
        </div>
        {icon ? <div className="rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container-low)] p-2 text-[var(--m3-primary)] opacity-90">{icon}</div> : null}
      </header>
      {children}
    </section>
  );
}
