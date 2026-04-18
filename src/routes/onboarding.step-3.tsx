import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  RotateCw,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { useOnboardingProfile } from "@/lib/onboarding-store";
import { analyzeOnboarding } from "@/lib/onboarding-analysis.functions";
import type { RoleAnalysis, RoleTask } from "@/lib/assessment-types";

export const Route = createFileRoute("/onboarding/step-3")({
  component: Step3,
});

const FACTS = [
  "43% of Finance tasks can be fully automated today",
  "Teams using AI augmentation recover 8+ hrs/week on average",
  "0 jobs need to be eliminated — humans + AI > AI alone",
];

function Step3() {
  const router = useRouter();
  const { profile, update, hydrated } = useOnboardingProfile();
  const allSkills = useMemo(
    () => [...profile.selected_tasks, ...profile.custom_tasks],
    [profile.selected_tasks, profile.custom_tasks],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await analyzeOnboarding({
        data: {
          department: profile.selected_department || "Unspecified",
          skills: allSkills,
        },
      });
      if (!res.ok) throw new Error(res.error);
      return res.analysis;
    },
    onSuccess: (analysis) => {
      update({ analysis });
    },
  });

  useEffect(() => {
    if (profile.analysis) return;
    if (!profile.selected_department || allSkills.length === 0) return;
    if (mutation.isPending || mutation.isSuccess || mutation.isError) return;
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.analysis, profile.selected_department, allSkills.length]);

  if (!hydrated) {
    return <LoadingPhase />;
  }

  if (!profile.selected_department || allSkills.length === 0) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-2xl border border-[#F5C84C]/40 bg-white p-6 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <p className="text-sm text-slate-700">
          We need your department and at least one task before we can analyze.
        </p>
        <Link
          to="/onboarding/step-1"
          className="inline-block rounded-xl bg-[#F5C84C] px-4 py-2 text-sm font-semibold text-[#0B1F3B]"
        >
          Start over
        </Link>
      </div>
    );
  }

  const analysis = profile.analysis ?? mutation.data ?? null;

  if (mutation.isError && !analysis) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-white/10 bg-white p-8 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <AlertCircle className="mx-auto h-10 w-10 text-rose-500" />
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Analysis hit a snag
        </h2>
        <p className="text-sm text-slate-600">
          {mutation.error instanceof Error ? mutation.error.message : "Unknown error"}
        </p>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0B1F3B] px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
        >
          <RotateCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) {
    return <LoadingPhase />;
  }

  return (
    <ReportPhase
      analysis={analysis}
      department={profile.selected_department || analysis.department}
      skillsCount={allSkills.length}
      onRegenerate={() => {
        update({ analysis: null });
        mutation.reset();
        router.invalidate();
      }}
    />
  );
}

// ===== Loading phase =====

function LoadingPhase() {
  const [step, setStep] = useState(0);
  const [factIdx, setFactIdx] = useState(0);

  const items = [
    "Mapping your department to industry benchmarks…",
    "Generating role-specific tasks from your skills…",
    "Classifying tasks across Automate / Augment / Own…",
    "Calculating monthly hours saved…",
  ];

  useEffect(() => {
    if (step >= items.length) return;
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, items.length)), 1400);
    return () => clearTimeout(t);
  }, [step, items.length]);

  useEffect(() => {
    const t = setInterval(() => setFactIdx((i) => (i + 1) % FACTS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-white/10 bg-white p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0B1F3B]" />
        <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
          Building your AI opportunity report…
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          This usually takes 5–15 seconds.
        </p>

        <ul className="mx-auto mt-7 max-w-sm space-y-2.5 text-left text-sm text-slate-700">
          {items.map((label, i) => {
            const visible = i <= step;
            const completed = i < step;
            if (!visible) return null;
            return (
              <li
                key={label}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 animate-fade-in"
              >
                {completed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-[#0B1F3B]" />
                )}
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div
        key={factIdx}
        className="mx-auto mt-6 max-w-md rounded-xl border-l-4 border-[#F5C84C] bg-white/5 px-4 py-3 text-left text-sm italic text-white/85 backdrop-blur-sm animate-fade-in"
      >
        {FACTS[factIdx]}
      </div>
    </div>
  );
}

// ===== Report phase =====

function ReportPhase({
  analysis,
  department,
  skillsCount,
  onRegenerate,
}: {
  analysis: RoleAnalysis;
  department: string;
  skillsCount: number;
  onRegenerate: () => void;
}) {
  const { summary, tasks } = analysis;
  const total = summary.automate_count + summary.augment_count + summary.own_count;
  const automatePct = total > 0 ? Math.round((summary.automate_count / total) * 100) : 0;

  const band =
    automatePct >= 60
      ? "Advanced"
      : automatePct >= 40
        ? "Proficient"
        : automatePct >= 20
          ? "Developing"
          : "Emerging";

  const tools = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of tasks) {
      for (const tool of t.tools_suggested ?? []) {
        counts.set(tool, (counts.get(tool) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name]) => name);
  }, [tasks]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
        <div className="border-b border-slate-100 p-7 sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#0B1F3B]">
                Your AI Opportunity Report
              </div>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {department}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {skillsCount} skills analyzed · {tasks.length} tasks generated · readiness band:{" "}
                <span className="font-semibold text-[#0B1F3B]">{band}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:border-[#F5C84C] hover:text-slate-900"
            >
              <RotateCw className="h-3 w-3" />
              Regenerate
            </button>
          </div>
        </div>

        {/* KPI row — navy hero */}
        <div className="relative overflow-hidden bg-[#0B1F3B] p-7 text-white sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative grid gap-4 sm:grid-cols-3">
            <BigStat
              icon={Clock}
              label="Hours saved / month"
              value={summary.estimated_monthly_hours_saved.toFixed(0)}
              sub="From AI deployment"
            />
            <BigStat
              icon={TrendingUp}
              label="FTE equivalent"
              value={summary.estimated_fte_equivalent_saved.toFixed(2)}
              sub="Per month"
            />
            <BigStat
              icon={Sparkles}
              label="Automation potential"
              value={`${automatePct}%`}
              sub={`${summary.automate_count} of ${total} tasks`}
            />
          </div>
        </div>

      {/* Bucket counts — stack-ranked by count desc */}
        <div className="grid grid-cols-3 gap-2 px-7 py-5 text-center sm:px-9">
          {(
            [
              { label: "Automate", count: summary.automate_count, tone: "navy" as const },
              { label: "Augment", count: summary.augment_count, tone: "gold" as const },
              { label: "Author", count: summary.own_count, tone: "emerald" as const },
            ].sort((a, b) => b.count - a.count)
          ).map((b) => (
            <BucketTile key={b.label} label={b.label} count={b.count} tone={b.tone} />
          ))}
        </div>
      </div>

      {/* Task breakdown */}
      <div className="rounded-2xl border border-white/10 bg-white p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:p-9">
        <h3 className="text-base font-semibold tracking-tight text-slate-900">
          Task-by-task breakdown
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Hours per month, before vs. after AI deployment.
        </p>
        <div className="mt-5 space-y-2">
          {tasks.map((t) => (
            <TaskRow key={t.task_id} task={t} />
          ))}
        </div>
      </div>

      {/* Recommended tools */}
      {tools.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:p-9">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-[#F5C84C]" />
            <h3 className="text-base font-semibold tracking-tight text-slate-900">
              Recommended AI tools
            </h3>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {tools.map((name) => (
              <li
                key={name}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-sm text-slate-800"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="font-medium">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skill roadmap CTA — sample-report style */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1F3B] p-7 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:p-9">
        <div
          aria-hidden
          className="pointer-events-none absolute opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C84C]/40 bg-[#F5C84C]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#F5C84C]">
          Your skill roadmap is ready
        </span>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Turn this into your daily AI workflow.
        </h3>
        <ul className="mt-5 space-y-2.5 text-sm text-white/85">
          {(() => {
            const automates = tasks
              .filter((t) => t.bucket === "AUTOMATE")
              .sort((a, b) => b.monthly_hours_saved - a.monthly_hours_saved);
            const topName = automates[0]?.task_name;
            const moreCount = Math.max(0, summary.automate_count - 1);
            const bullets: { text: React.ReactNode }[] = [];
            if (topName) {
              bullets.push({
                text: (
                  <>
                    Customize <strong className="text-white">{topName}</strong>
                    {moreCount > 0 ? (
                      <>
                        {" "}(and <strong className="text-white">{moreCount}</strong> more)
                      </>
                    ) : null}{" "}
                    inside Emulation Station
                  </>
                ),
              });
            }
            bullets.push({
              text: (
                <>
                  Reclaim{" "}
                  <strong className="text-white">
                    {summary.estimated_monthly_hours_saved.toFixed(0)}h/month
                  </strong>{" "}
                  — that's{" "}
                  <strong className="text-white">
                    {summary.estimated_fte_equivalent_saved.toFixed(2)} FTE
                  </strong>{" "}
                  of your week back
                </>
              ),
            });
            if (summary.own_count > 0) {
              bullets.push({
                text: (
                  <>
                    Keep authoring the{" "}
                    <strong className="text-white">{summary.own_count}</strong> tasks only you can do
                  </>
                ),
              });
            }
            return bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5C84C]" />
                <span>{b.text}</span>
              </li>
            ));
          })()}
        </ul>
        <Link
          to="/workflowai"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[#F5C84C] px-8 py-4 text-base font-semibold tracking-tight text-[#0B1F3B] shadow-lg shadow-black/30 transition hover:brightness-110"
        >
          Open Emulation Station
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Methodology footer */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-5 py-4 text-xs italic leading-relaxed text-slate-600">
        <span className="font-semibold not-italic text-slate-700">Methodology:</span>{" "}
        hours derived from your reported task volume × industry-standard
        time-per-instance, with AI savings modeled per task type (Automate /
        Augment / Author). Estimates refresh whenever you add or remove skills.
      </div>

      {/* Back link */}
      <div className="pt-1">
        <Link
          to="/onboarding/step-2"
          className="text-sm text-white/60 transition hover:text-white"
        >
          ← Back to tasks
        </Link>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: RoleTask }) {
  const beforeHours = (task.avg_minutes_per_instance * task.instances_per_month) / 60;
  const afterHours = Math.max(0, beforeHours - task.monthly_hours_saved);
  const pctRemaining = beforeHours > 0 ? Math.max(4, (afterHours / beforeHours) * 100) : 4;

  const barByBucket: Record<RoleTask["bucket"], string> = {
    AUTOMATE: "bg-[#0B1F3B]",
    AUGMENT: "bg-[#F5C84C]",
    OWN: "bg-emerald-500",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BucketBadge bucket={task.bucket} />
          <span className="text-sm font-medium text-slate-900">{task.task_name}</span>
        </div>
        <div className="font-mono text-xs text-slate-500">
          {beforeHours.toFixed(1)}h →{" "}
          <span className="font-semibold text-slate-900">{afterHours.toFixed(1)}h</span>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full ${barByBucket[task.bucket]}`}
          style={{ width: `${pctRemaining}%` }}
        />
      </div>
      {task.ai_action && (
        <p className="mt-2 text-xs text-slate-500">
          <span className="font-semibold text-slate-700">AI does:</span>{" "}
          {task.ai_action}
        </p>
      )}
    </div>
  );
}

function BucketBadge({ bucket }: { bucket: RoleTask["bucket"] }) {
  const tones: Record<RoleTask["bucket"], string> = {
    AUTOMATE: "bg-[#0B1F3B]/10 text-[#0B1F3B] border-[#0B1F3B]/20",
    AUGMENT: "bg-[#F5C84C]/15 text-[#7c5e10] border-[#F5C84C]/40",
    OWN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tones[bucket]}`}
    >
      {bucket === "OWN" ? "AUTHOR" : bucket}
    </span>
  );
}

function BucketTile({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "navy" | "gold" | "emerald";
}) {
  const tones = {
    navy: "border-[#0B1F3B]/15 bg-[#0B1F3B]/5",
    gold: "border-[#F5C84C]/40 bg-[#F5C84C]/10",
    emerald: "border-emerald-200 bg-emerald-50",
  };
  const labelTone = {
    navy: "text-[#0B1F3B]",
    gold: "text-[#7c5e10]",
    emerald: "text-emerald-700",
  };
  return (
    <div className={`rounded-xl border px-3 py-2.5 ${tones[tone]}`}>
      <div
        className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${labelTone[tone]}`}
      >
        {label}
      </div>
      <div className="mt-0.5 text-2xl font-semibold tracking-tight text-slate-900">
        {count}
      </div>
    </div>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C84C]">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5 text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>
      <div className="mt-1 text-xs text-white/60">{sub}</div>
    </div>
  );
}
