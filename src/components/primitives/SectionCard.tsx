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
        "m3-card scroll-mt-24 border border-[var(--m3-outline)]/80 p-6 md:p-8",
        className,
      )}
    >
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl tracking-tight text-[var(--m3-on-surface)]">{title}</h2>
          {subtitle ? (
            <p className="mt-2 max-w-3xl text-sm md:text-base text-[var(--m3-on-surface-variant)]">{subtitle}</p>
          ) : null}
        </div>
        {icon ? <div className="text-[var(--m3-primary)]">{icon}</div> : null}
      </header>
      {children}
    </section>
  );
}
