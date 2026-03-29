"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { primaryNav } from "@/data/navigation";
import { cn } from "@/lib/utils";

type SidebarNavProps = {
  compact?: boolean;
};

export function SidebarNav({ compact = false }: SidebarNavProps) {
  const pathname = usePathname();
  const [active, setActive] = useState<string>(primaryNav[0]?.id ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) {
          setActive(visible.target.id);
        }
      },
      {
        rootMargin: "-25% 0px -60% 0px",
        threshold: 0.1,
      },
    );

    for (const item of primaryNav.filter((it) => (it.kind || "anchor") === "anchor")) {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, []);

  if (compact) {
    return (
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-full border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-4 py-2 text-sm text-[var(--m3-on-surface)]"
          aria-expanded={open}
          aria-controls="mobile-drawer"
        >
          <Menu className="size-4" />
          Sections
        </button>
        <AnimatePresence>
          {open ? (
            <motion.nav
              id="mobile-drawer"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="surface mt-3 p-3"
            >
              <ul className="space-y-2">
                {primaryNav.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm",
                        active === item.id || (item.kind === "route" && pathname === item.href)
                          ? "bg-[var(--m3-primary)]/16 text-[var(--m3-primary)]"
                          : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-high)] hover:text-[var(--m3-on-surface)]",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <aside className="hidden lg:block lg:sticky lg:top-6 lg:h-[calc(100dvh-3rem)]">
      <nav className="surface h-full overflow-y-auto p-4" aria-label="Table of contents">
        <div className="mb-4 border-b border-[var(--m3-outline)]/60 pb-4">
          <p className="font-mono text-xs uppercase tracking-[0.12em] text-[var(--m3-on-surface-variant)]">Documentation Navigator</p>
          <h2 className="mt-2 font-display text-xl text-[var(--m3-on-surface)]">AI Engineering Hub</h2>
        </div>
        <ul className="space-y-2">
          {primaryNav.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "group block rounded-md border px-3 py-3 transition-all",
                  active === item.id || (item.kind === "route" && pathname === item.href)
                    ? "border-[var(--m3-primary)]/60 bg-[var(--m3-primary)]/14"
                    : "border-transparent text-[var(--m3-on-surface-variant)] hover:border-[var(--m3-outline)] hover:bg-[var(--m3-surface-container)] hover:text-[var(--m3-on-surface)]",
                )}
              >
                <span className="block text-sm font-semibold text-[var(--m3-on-surface)]">{item.label}</span>
                <span className="mt-1 block text-xs leading-5 text-[var(--m3-on-surface-variant)]">{item.description}</span>
              </Link>
            </li>
          ))}
        </ul>
        <Link
          href="/repository"
          className="mt-6 block rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2 text-sm text-[var(--m3-secondary)] hover:bg-[var(--m3-surface-container-high)]"
        >
          Open full project repository
        </Link>
      </nav>
    </aside>
  );
}
