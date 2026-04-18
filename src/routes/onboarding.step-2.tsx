import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Plus, X, ArrowRight } from "lucide-react";
import { getDepartment } from "@/lib/job-categories";
import { useOnboardingProfile } from "@/lib/onboarding-store";

export const Route = createFileRoute("/onboarding/step-2")({
  component: Step2,
});

function Step2() {
  const navigate = useNavigate();
  const { profile, update, hydrated } = useOnboardingProfile();

  const dept = profile.selected_department
    ? getDepartment(profile.selected_department)
    : undefined;

  const [selected, setSelected] = useState<string[]>(profile.selected_tasks);
  const [custom, setCustom] = useState<string[]>(profile.custom_tasks);
  const [draft, setDraft] = useState("");

  // Keep local state in sync when the profile loads from localStorage
  // after mount (SSR/hydration timing) or changes elsewhere.
  useEffect(() => {
    setSelected(profile.selected_tasks);
    setCustom(profile.custom_tasks);
  }, [profile.selected_tasks, profile.custom_tasks]);

  // Pre-select the department's top skills when the active top_skills schema
  // doesn't match what was last auto-applied. This handles three cases:
  //  (a) fresh visit (no signature stored)
  //  (b) department changed (step 1 clears selections + signature)
  //  (c) job-categories.ts top_skills was updated since the user last saved —
  //      we re-apply the new defaults so the chips reflect the current schema.
  useEffect(() => {
    if (!dept) return;
    const currentSig = `${dept.category}::${dept.top_skills.join("|")}`;
    if (profile.top_skills_signature === currentSig) return;
    setSelected(dept.top_skills);
    update({
      selected_tasks: dept.top_skills,
      top_skills_signature: currentSig,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept?.category, profile.top_skills_signature]);

  const totalCount = selected.length + custom.length;

  const toggle = (s: string) => {
    setSelected((prev) => {
      const next = prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s];
      update({ selected_tasks: next });
      return next;
    });
  };

  const addCustom = () => {
    const v = draft.trim();
    if (!v) return;
    if (custom.includes(v) || selected.includes(v)) {
      setDraft("");
      return;
    }
    const next = [...custom, v];
    setCustom(next);
    setDraft("");
    update({ custom_tasks: next });
  };

  const removeCustom = (s: string) => {
    const next = custom.filter((x) => x !== s);
    setCustom(next);
    update({ custom_tasks: next });
  };

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCustom();
    }
  };

  const encouragement = useMemo(() => {
    if (totalCount >= 16) return "Great — we have enough to analyze your role 🎯";
    if (totalCount >= 6) return "Good start — you're building your profile";
    return "Keep going — add more to get a full picture";
  }, [totalCount]);

  const canContinue = totalCount >= 3;

  return (
    <div className="space-y-10">
      <div className="text-center sm:text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C84C]/40 bg-[#F5C84C]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F5C84C]">
          Step 02 — Tasks
        </span>
        <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-[-0.015em] text-white sm:text-5xl">
          What fills your calendar?
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          Select everything that sounds like your job. Be honest — this is where
          the AI magic starts.
        </p>
      </div>

      {!dept && (
        <div className="rounded-2xl border border-[#F5C84C]/40 bg-[#F5C84C]/10 p-5 text-sm text-white">
          Pick a department first.{" "}
          <Link
            to="/onboarding/step-1"
            className="font-semibold text-[#F5C84C] underline"
          >
            Go back
          </Link>
        </div>
      )}

      {dept && (
        <>
          <div className="rounded-2xl border border-white/10 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                {dept.category} · {dept.skills.length} skills
              </div>
              <div className="text-sm font-semibold text-[#0B1F3B]">
                <span className="text-[#F5C84C]">●</span> {totalCount}{" "}
                {totalCount === 1 ? "task" : "tasks"} selected
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {dept.skills.map((s) => {
                const active = selected.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggle(s)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all duration-150 ${
                      active
                        ? "border-[#F5C84C] bg-[#F5C84C] font-semibold text-[#0B1F3B] shadow-sm animate-scale-in"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#F5C84C]/60 hover:bg-[#F5C84C]/5"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
              {custom.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#F5C84C] bg-[#F5C84C] px-4 py-2 text-sm font-semibold text-[#0B1F3B] animate-scale-in"
                >
                  {s}
                  <button
                    type="button"
                    onClick={() => removeCustom(s)}
                    className="grid h-4 w-4 place-items-center rounded-full bg-[#0B1F3B]/15 hover:bg-[#0B1F3B]/30"
                    aria-label={`Remove ${s}`}
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
            <label className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Don't see your tasks? Add your own:
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type a task and press Enter…"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#F5C84C] focus:outline-none focus:ring-2 focus:ring-[#F5C84C]/30"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1F3B] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          <div className="text-center text-sm font-medium text-white/70 sm:text-left">
            {encouragement}
          </div>
        </>
      )}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
        <Link
          to="/onboarding/step-1"
          className="text-center text-sm text-white/60 transition hover:text-white"
        >
          ← Back
        </Link>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => navigate({ to: "/onboarding/step-3" })}
          className={`inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold tracking-tight transition-all ${
            canContinue
              ? "bg-[#F5C84C] text-[#0B1F3B] shadow-lg shadow-black/30 hover:brightness-110 animate-scale-in"
              : "cursor-not-allowed bg-white/10 text-white/40"
          }`}
        >
          Analyze My Role
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
