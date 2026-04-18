import { Link, useLocation } from "@tanstack/react-router";
import { PlayCircle, LogOut, ChevronDown, Menu, X } from "lucide-react";
import logoUrl from "@/assets/upskill-usa-logo.png";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useState, useRef, useEffect } from "react";

const marketingNav = [
  { to: "/opportunity", label: "Opportunity" },
  { to: "/preview/executive-audit", label: "Executives" },
  { to: "/preview/employee-analysis", label: "Employees" },
  { to: "/preview/agent-builder", label: "Emulators" },
  { to: "/faq", label: "FAQ" },
] as const;

const adminNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/employee", label: "Employee View" },
  { to: "/assessment", label: "Assessment" },
  { to: "/skill-module", label: "Emulator Builder" },
  { to: "/admin/employees", label: "Team" },
  { to: "/admin/governance", label: "Governance" },
] as const;

const employeeNav = [
  { to: "/employee", label: "My Report" },
  { to: "/assessment", label: "Assessment" },
  { to: "/skill-module", label: "Emulator Builder" },
] as const;

export function AppHeader() {
  const { pathname } = useLocation();
  const auth = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Close mobile drawer whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const nav =
    auth.role === "admin"
      ? adminNav
      : auth.role === "employee"
        ? employeeNav
        : marketingNav;

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-6xl items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight" aria-label="UpSkill USA — Home">
          <img src={logoUrl} alt="UpSkill USA" className="h-16 w-auto" />
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-center text-sm font-bold transition-colors",
                  active
                    ? "bg-primary text-warning"
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
                className="inline-flex items-center gap-2 rounded-full border border-brand bg-brand px-3 py-1.5 text-xs font-medium text-warning transition-colors hover:bg-brand/90"
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
                <span className="grid h-5 w-5 place-items-center rounded-full bg-warning text-[10px] font-bold text-warning-foreground">
                  {(auth.fullName ?? auth.user?.email ?? "?")[0]?.toUpperCase()}
                </span>
                <span className="hidden max-w-[140px] truncate sm:inline">
                  {auth.orgName ?? "Workspace"}
                </span>
                <span
                  className={`hidden rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase sm:inline ${auth.role === "admin" ? "bg-warning/20 text-warning" : "bg-muted text-muted-foreground"}`}
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

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-card text-foreground hover:bg-accent md:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      {mobileOpen && (
        <nav
          id="mobile-nav"
          className="border-t bg-background/95 px-6 pb-4 pt-2 backdrop-blur md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <li key={n.to}>
                  <Link
                    to={n.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2.5 text-sm font-bold transition-colors",
                      active
                        ? "bg-primary text-warning"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                    )}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
            {!auth.isAuthenticated && (
              <li>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Sign in
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
