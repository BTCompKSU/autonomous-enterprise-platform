import { Link, useLocation } from "@tanstack/react-router";
import { DemoToggle } from "@/components/judging/DemoMode";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo.png";

const nav = [
  { to: "/opportunity", label: "Opportunity Map" },
  { to: "/dashboard", label: "Executive Summary" },
  { to: "/employee", label: "Employee Report" },
  { to: "/skill-module", label: "Agent Builder" },
] as const;

export function AppHeader() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-6 px-6">
        <Link
          to="/"
          aria-label="UpSkill USA — Home"
          className="flex items-center transition-opacity hover:opacity-80"
        >
          <img
            src={logoUrl}
            alt="UpSkill USA"
            width={2064}
            height={512}
            className="h-14 w-auto"
          />
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "rounded-full px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <DemoToggle />
        </div>
      </div>
    </header>
  );
}
