import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import {
  QUICK_ROLES,
  fuzzyMatchRoles,
  type DepartmentKey,
} from "@/lib/job-categories";
import { useOnboardingProfile } from "@/lib/onboarding-store";

export const Route = createFileRoute("/onboarding/step-1")({
  component: Step1,
});

function Step1() {
  const navigate = useNavigate();
  const { profile, update } = useOnboardingProfile();
  const [selected, setSelected] = useState<string>(profile.selected_role);
  const [typed, setTyped] = useState("");

  const matches = useMemo(() => fuzzyMatchRoles(typed, 6), [typed]);
  const canContinue = selected.length > 0 || typed.trim().length >= 3;

  const pickQuickRole = (title: string, dept: DepartmentKey) => {
    setSelected(title);
    setTyped("");
    update({ selected_role: title, selected_department: dept });
  };

  const pickFromMatch = (label: string, dept: DepartmentKey) => {
    setSelected(label);
    setTyped(label);
    update({ selected_role: label, selected_department: dept });
  };

  const handleContinue = () => {
    const finalRole = selected || typed.trim();
    update({ selected_role: finalRole });
    navigate({ to: "/onboarding/step-2" });
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          What do you do all day?
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Pick the closest match. You can refine later. No judgment — every job
          on this list is valuable.
        </p>
      </div>

      {/* Section 1 */}
      <section>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
          Most common roles
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {QUICK_ROLES.map((r) => {
            const active = selected === r.title;
            return (
              <button
                key={r.title}
                type="button"
                onClick={() => pickQuickRole(r.title, r.department)}
                className={`group relative rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] ${
                  active
                    ? "border-warning bg-warning/10 shadow-[0_0_0_3px_color-mix(in_oklab,var(--warning)_25%,transparent)]"
                    : "border-border bg-card hover:border-warning/60 hover:bg-accent/40"
                }`}
              >
                {active && (
                  <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-warning text-warning-foreground animate-scale-in">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <div className="text-sm font-bold text-foreground">
                  {r.title}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {r.department}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 2 */}
      <section>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-warning">
          Or type your actual job title
        </div>
        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={typed}
            onChange={(e) => {
              setTyped(e.target.value);
              if (selected) setSelected("");
            }}
            placeholder="e.g., Service coordinator, inside sales rep, shop manager..."
            className="w-full rounded-lg border border-border bg-card py-3 pl-10 pr-4 text-sm transition focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/30"
          />

          {matches.length > 0 && (
            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border bg-popover shadow-lg animate-fade-in">
              {matches.map((m) => (
                <button
                  key={`${m.type}-${m.label}`}
                  type="button"
                  onClick={() => pickFromMatch(m.label, m.department)}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-accent"
                >
                  <span className="font-medium">{m.label}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {m.type} · {m.department}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-4 sm:flex-row sm:items-center">
        <Link
          to="/workflowai"
          className="text-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          Skip for now →
        </Link>
        <button
          type="button"
          disabled={!canContinue}
          onClick={handleContinue}
          className={`rounded-lg px-6 py-3 text-sm font-bold transition-all ${
            canContinue
              ? "bg-warning text-warning-foreground shadow hover:bg-warning/90 animate-scale-in"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
