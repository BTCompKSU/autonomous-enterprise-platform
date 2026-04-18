import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { getDepartment } from "@/lib/job-categories";
import { useOnboardingProfile } from "@/lib/onboarding-store";

export const Route = createFileRoute("/onboarding/step-2")({
  component: Step2,
});

function Step2() {
  const navigate = useNavigate();
  const { profile, update } = useOnboardingProfile();

  const dept = profile.selected_department
    ? getDepartment(profile.selected_department)
    : undefined;

  const [selected, setSelected] = useState<string[]>(profile.selected_tasks);
  const [custom, setCustom] = useState<string[]>(profile.custom_tasks);
  const [draft, setDraft] = useState("");

  // Auto-pre-select the department's top 5 skills the first time the user
  // lands here with an empty task list. Don't clobber later edits.
  useEffect(() => {
    if (!dept) return;
    if (profile.selected_tasks.length > 0 || profile.custom_tasks.length > 0) return;
    setSelected(dept.top_skills);
    update({ selected_tasks: dept.top_skills });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept?.category]);

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
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          What fills your calendar?
        </h1>
        <p className="mt-3 max-w-2xl text-base text-muted-foreground">
          Select everything that sounds like your job. Be honest — this is where
          the AI magic starts.
        </p>
      </div>

      {!dept && (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm">
          Pick a department first.{" "}
          <Link to="/onboarding/step-1" className="font-semibold text-warning underline">
            Go back
          </Link>
        </div>
      )}

      {dept && (
        <>
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {dept.category} · {dept.skills.length} skills
            </div>
            <div className="text-sm font-bold text-warning">
              {totalCount} {totalCount === 1 ? "task" : "tasks"} selected
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {dept.skills.map((s) => {
              const active = selected.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  className={`rounded-full border px-4 py-2 text-sm transition-all duration-150 ${
                    active
                      ? "border-warning bg-warning font-bold text-warning-foreground animate-scale-in"
                      : "border-border bg-card text-foreground hover:border-warning/60 hover:bg-accent/40"
                  }`}
                >
                  {s}
                </button>
              );
            })}
            {custom.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1.5 rounded-full border border-warning bg-warning px-4 py-2 text-sm font-bold text-warning-foreground animate-scale-in"
              >
                {s}
                <button
                  type="button"
                  onClick={() => removeCustom(s)}
                  className="grid h-4 w-4 place-items-center rounded-full bg-warning-foreground/20 hover:bg-warning-foreground/40"
                  aria-label={`Remove ${s}`}
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="rounded-xl border bg-card p-4">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Don't see your tasks? Add your own:
            </label>
            <div className="mt-2 flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKey}
                placeholder="Type a task and press Enter…"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-warning focus:outline-none focus:ring-2 focus:ring-warning/30"
              />
              <button
                type="button"
                onClick={addCustom}
                disabled={!draft.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-warning px-4 py-2.5 text-sm font-bold text-warning-foreground transition hover:bg-warning/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            {encouragement}
          </div>
        </>
      )}

      <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-4 sm:flex-row sm:items-center">
        <Link
          to="/onboarding/step-1"
          className="text-center text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← Back
        </Link>
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => navigate({ to: "/onboarding/step-3" })}
          className={`rounded-lg px-6 py-3 text-sm font-bold transition-all ${
            canContinue
              ? "bg-warning text-warning-foreground shadow hover:bg-warning/90 animate-scale-in"
              : "cursor-not-allowed bg-muted text-muted-foreground"
          }`}
        >
          Analyze My Role →
        </button>
      </div>
    </div>
  );
}
