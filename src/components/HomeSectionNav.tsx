import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { id: "opportunity", label: "Opportunity" },
  { id: "executives", label: "Executives" },
  { id: "employees", label: "Employees" },
  { id: "emulators", label: "Emulators" },
] as const;

export function HomeSectionNav() {
  const [active, setActive] = useState<string>("opportunity");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="sticky top-20 z-30 border-y bg-background/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-6 py-2">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold transition-colors",
              active === s.id
                ? "bg-primary text-warning"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {s.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
