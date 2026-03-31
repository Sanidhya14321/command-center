import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border border-[var(--m3-primary)]/45 bg-[var(--m3-primary)]/12 px-3 py-1 text-xs font-medium uppercase tracking-[0.1em] text-[var(--m3-primary)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
