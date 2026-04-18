import { Link, useLocation } from "@tanstack/react-router";
import { Cpu, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/opportunity", label: "Opportunity Landscape" },
  { to: "/dashboard", label: "Executive Audit" },
  { to: "/employee", label: "Employee Analysis" },
  { to: "/skill-module", label: "Agent Builder" },
] as const;

export function AppHeader() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
            <Cpu className="h-4 w-4 text-brand-glow" />
          </span>
          UpSkill <span className="text-brand">USA</span>
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
          <Link
            to="/demo"
            className="inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Watch Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
