"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
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
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Handle escape key
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [open]);

  if (compact) {
    return (
      <div className="lg:hidden" ref={menuRef}>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-md border border-[var(--m3-outline)] bg-[var(--m3-surface-container)] px-3 py-2 text-sm text-[var(--m3-on-surface)] transition-colors duration-200 hover:bg-[var(--m3-surface-container-high)] focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]"
          aria-expanded={open}
          aria-controls="mobile-drawer"
        >
          <Menu className="size-4" />
          <span className="text-xs font-medium">{open ? 'Close' : 'Sections'}</span>
        </button>
        <AnimatePresence>
          {open ? (
            <motion.nav
              id="mobile-drawer"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="surface mt-2 rounded-lg border border-[var(--m3-outline)] p-3"
              role="navigation"
              aria-label="Page sections"
            >
              <ul className="space-y-1">
                {primaryNav.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex min-h-[40px] cursor-pointer flex-col items-start rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]",
                        active === item.id || (item.kind === "route" && pathname === item.href)
                          ? "bg-[var(--m3-primary)]/16 text-[var(--m3-primary)] font-medium"
                          : "text-[var(--m3-on-surface-variant)] hover:bg-[var(--m3-surface-container-high)] hover:text-[var(--m3-on-surface)]",
                      )}
                      aria-current={active === item.id ? "page" : undefined}
                    >
                      <span>{item.label}</span>
                      <span className="mt-0.5 line-clamp-1 text-xs text-[var(--m3-on-surface-variant)]">{item.description}</span>
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
    <aside className="hidden lg:block" role="navigation" aria-label="Page sections">
      <nav className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto rounded-lg border border-[var(--m3-outline)]/45 bg-[var(--m3-surface-container-low)] p-3">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--m3-secondary)]">Navigate</p>
        <ul className="space-y-1">
          {primaryNav.map((item, index) => (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
            >
              <Link
                href={item.href}
                className={cn(
                  "block min-h-[40px] cursor-pointer rounded-md px-3 py-2.5 text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--m3-primary)]",
                  active === item.id || (item.kind === "route" && pathname === item.href)
                    ? "border border-[var(--m3-primary)]/60 bg-[var(--m3-primary)]/12 text-[var(--m3-primary)] font-medium"
                    : "border border-[var(--m3-outline)]/35 bg-[var(--m3-surface-container)] hover:bg-[var(--m3-surface-container-high)] text-[var(--m3-on-surface-variant)] hover:text-[var(--m3-on-surface)]",
                )}
                aria-current={active === item.id ? "page" : undefined}
              >
                <span className="text-sm leading-tight">{item.label}</span>
                <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--m3-on-surface-variant)]">{item.description}</span>
              </Link>
            </motion.li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
