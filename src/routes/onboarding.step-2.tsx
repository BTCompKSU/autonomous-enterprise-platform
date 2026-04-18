import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Crown,
  Settings,
  DollarSign,
  TrendingUp,
  Megaphone,
  Code,
  Brain,
  Users,
  Scale,
  Check,
  Pencil,
} from "lucide-react";
import {
  ENTERPRISE_JOB_CATEGORIES,
  type DepartmentKey,
} from "@/lib/job-categories";
import { useOnboardingProfile } from "@/lib/onboarding-store";

export const Route = createFileRoute("/onboarding/step-2")({
  component: Step2,
});

const ICONS: Record<DepartmentKey, typeof Crown> = {
  "Executive Leadership": Crown,
  Operations: Settings,
  "Finance and Accounting": DollarSign,
  Sales: TrendingUp,
  Marketing: Megaphone,
  "Engineering and IT": Code,
  "Data and AI": Brain,
  "HR and People Operations": Users,
  "Legal and Compliance": Scale,
};

function Step2() {
  const navigate = useNavigate();
  const { profile, update } = useOnboardingProfile();
  const [selected, setSelected] = useState<DepartmentKey | "">(
    profile.selected_department,
  );

  const pick = (dept: DepartmentKey) => {
    setSelected(dept);
    update({ selected_department: dept });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Where do you sit in the org?
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          This helps us match your tasks to the right AI workflows.
        </p>
      </div>

      {profile.selected_role && (
        <Link
          to="/onboarding/step-1"
          className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-warning/60 hover:text-foreground"
        >
          ← {profile.selected_role}
          <Pencil className="h-3 w-3" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ENTERPRISE_JOB_CATEGORIES.map((c) => {
          const Icon = ICONS[c.category];
          const active = selected === c.category;
          return (
            <button
              key={c.category}
              type="button"
              onClick={() => pick(c.category)}
              className={`group relative flex h-full min-h-[140px] flex-col items-center justify-center rounded-xl border p-5 text-center transition-all duration-200 hover:scale-[1.02] ${
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
              <Icon
                className={`h-8 w-8 ${
                  active ? "text-warning" : "text-brand"
                }`}
              />
              <div className="mt-3 text-base font-bold text-foreground">
                {c.category}
              </div>
              <div className="mt-1 text-[12px] italic text-muted-foreground">
                {c.focus}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-4 sm:flex-row sm:items-center">
        <Link
          to="/onboarding/step-1"
          className="text-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back
        </Link>
        <button
          type="button"
          disabled={!selected}
          onClick={() => navigate({ to: "/onboarding/step-3" })}
          className={`rounded-lg px-6 py-3 text-sm font-bold transition-all ${
            selected
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
