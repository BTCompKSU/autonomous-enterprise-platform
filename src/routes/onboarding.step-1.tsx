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
  ArrowRight,
} from "lucide-react";
import {
  ENTERPRISE_JOB_CATEGORIES,
  type DepartmentKey,
} from "@/lib/job-categories";
import { useOnboardingProfile } from "@/lib/onboarding-store";

export const Route = createFileRoute("/onboarding/step-1")({
  component: Step1,
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

function Step1() {
  const navigate = useNavigate();
  const { profile, update } = useOnboardingProfile();
  const [selected, setSelected] = useState<DepartmentKey | "">(
    profile.selected_department,
  );

  const pick = (dept: DepartmentKey) => {
    setSelected(dept);
    // Reset task selections whenever the department changes so step 2
    // can pre-select the new department's top skills cleanly.
    if (dept !== profile.selected_department) {
      update({
        selected_department: dept,
        selected_tasks: [],
        custom_tasks: [],
        top_skills_signature: "",
      });
    } else {
      update({ selected_department: dept });
    }
  };

  return (
    <div className="space-y-10">
      <div className="text-center sm:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C84C]/40 bg-[#F5C84C]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F5C84C]">
          Step 01 — Department
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.015em] text-white sm:text-5xl">
          Where do you sit in the org?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          This helps us match your tasks to the right AI workflows.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ENTERPRISE_JOB_CATEGORIES.map((c) => {
          const Icon = ICONS[c.category];
          const active = selected === c.category;
          return (
            <button
              key={c.category}
              type="button"
              onClick={() => pick(c.category)}
              className={`group relative flex h-full min-h-[148px] flex-col items-center justify-center rounded-2xl border p-5 text-center transition-all duration-200 hover:scale-[1.02] ${
                active
                  ? "border-[#F5C84C] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] ring-2 ring-[#F5C84C]"
                  : "border-white/10 bg-white shadow-[0_12px_40px_-15px_rgba(0,0,0,0.45)] hover:border-[#F5C84C]/60"
              }`}
            >
              {active && (
                <span className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-[#F5C84C] text-[#0B1F3B] animate-scale-in">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              )}
              <Icon
                className={`h-8 w-8 ${active ? "text-[#F5C84C]" : "text-[#0B1F3B]"}`}
              />
              <div className="mt-3 text-base font-semibold tracking-tight text-slate-900">
                {c.category}
              </div>
              <div className="mt-1 text-[12px] italic text-slate-500">
                {c.focus}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse items-stretch justify-end gap-3 pt-4 sm:flex-row sm:items-center">
        <Link
          to="/workflowai"
          className="text-center text-sm text-white/60 transition hover:text-white"
        >
          Skip for now →
        </Link>
        <button
          type="button"
          disabled={!selected}
          onClick={() => navigate({ to: "/onboarding/step-2" })}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold tracking-tight transition-all ${
            selected
              ? "bg-[#F5C84C] text-[#0B1F3B] shadow-lg shadow-black/30 hover:brightness-110 animate-scale-in"
              : "cursor-not-allowed bg-white/10 text-white/40"
          }`}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
