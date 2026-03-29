import { type ReactNode } from "react";
import { AlertCircle, CheckCircle2, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "success" | "warning";

type CalloutProps = {
  title: string;
  children: ReactNode;
  variant?: CalloutVariant;
};

const variantStyles: Record<CalloutVariant, string> = {
  info: "border-[var(--m3-primary)]/45 bg-[var(--m3-primary)]/8 text-[var(--m3-on-surface)]",
  success: "border-emerald-400/45 bg-emerald-400/8 text-[var(--m3-on-surface)]",
  warning: "border-amber-400/45 bg-amber-300/8 text-[var(--m3-on-surface)]",
};

const iconMap = {
  info: <Lightbulb className="size-5" />,
  success: <CheckCircle2 className="size-5" />,
  warning: <AlertCircle className="size-5" />,
};

export function Callout({ title, children, variant = "info" }: CalloutProps) {
  return (
    <div className={cn("rounded-md border p-4", variantStyles[variant])}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        {iconMap[variant]}
        <span>{title}</span>
      </div>
      <div className="text-sm leading-6 text-[var(--m3-on-surface-variant)]">{children}</div>
    </div>
  );
}
