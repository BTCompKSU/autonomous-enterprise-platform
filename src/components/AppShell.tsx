import { Link, useLocation } from "@tanstack/react-router";
import { Cpu, PlayCircle, LogOut, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useState, useRef, useEffect } from "react";

const marketingNav = [
  { to: "/opportunity", label: "Opportunity Landscape" },
  { to: "/preview/executive-audit", label: "Executive Audit" },
  { to: "/preview/employee-analysis", label: "Employee Analysis" },
  { to: "/preview/agent-builder", label: "Agent Builder" },
  { to: "/faq", label: "FAQ" },
] as const;

const adminNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/employee", label: "Employee View" },
  { to: "/assessment", label: "Assessment" },
  { to: "/skill-module", label: "Agent Builder" },
  { to: "/admin/employees", label: "Team" },
  { to: "/admin/governance", label: "Governance" },
] as const;

const employeeNav = [
  { to: "/employee", label: "My Report" },
  { to: "/assessment", label: "Assessment" },
  { to: "/skill-module", label: "Agent Builder" },
] as const;

export function AppHeader() {
  const { pathname } = useLocation();
  const auth = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const nav =
    auth.role === "admin"
      ? adminNav
      : auth.role === "employee"
        ? employeeNav
        : marketingNav;

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
          {!auth.isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
              >
                Sign in
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-3 py-1.5 text-xs font-medium text-brand-foreground transition-colors hover:bg-brand/90"
              >
                <PlayCircle className="h-3.5 w-3.5" />
                Watch Demo
              </Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent"
              >
                <span className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-brand-foreground">
                  {(auth.fullName ?? auth.user?.email ?? "?")[0]?.toUpperCase()}
                </span>
                <span className="max-w-[140px] truncate">{auth.orgName ?? "Workspace"}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${auth.role === "admin" ? "bg-brand/20 text-brand" : "bg-muted text-muted-foreground"}`}
                >
                  {auth.role}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border bg-popover p-1 shadow-lg">
                  <div className="border-b px-3 py-2">
                    <div className="truncate text-xs font-semibold">{auth.fullName}</div>
                    <div className="truncate text-[11px] text-muted-foreground">
                      {auth.user?.email}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      await auth.signOut();
                      window.location.href = "/";
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs hover:bg-accent"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
