import { cn } from "@/lib/utils";

type SkeletonLoaderProps = {
  className?: string;
};

export function SkeletonLoader({ className }: SkeletonLoaderProps) {
  return <div className={cn("skeleton rounded-2xl", className)} aria-hidden="true" />;
}
