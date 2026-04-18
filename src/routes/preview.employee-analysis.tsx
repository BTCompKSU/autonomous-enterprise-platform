import { createFileRoute } from "@tanstack/react-router";
import { AppHeader } from "@/components/AppShell";
import { PreviewBanner, BottomCTA } from "./preview.executive-audit";
import { Clock, TrendingUp, Sparkles, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/preview/employee-analysis")({
  head: () => ({
    meta: [
      { title: "Sample Employee Analysis — UpSkill USA" },
      {
        name: "description",
        content:
          "See how a single employee's week transforms with AI: hours recovered, tasks automated vs. owned, and a personalized upskilling pathway.",
      },
      { property: "og:title", content: "Sample Employee Analysis — UpSkill USA" },
      {
        property: "og:description",
        content:
          "Preview a personalized AI readiness analysis for a real employee. Run yours free.",
      },
    ],
  }),
  component: PreviewEmployeeAnalysis,
});

const MARIA = {
  name: "Maria Alvarez",
  role: "Senior Accounts Payable Specialist",
  department: "Finance",
  tenure: "7 years",
  weeklyHours: 40,
  recovered: 17.8,
  readiness: 82,
  tasks: [
    {
      label: "Invoice data entry",
      category: "Automate",
      before: 9.5,
      after: 0.4,
    },
    {
      label: "PO matching & exceptions",
      category: "Automate",
      before: 6.0,
      after: 1.2,
    },
    {
      label: "Vendor inquiries (email)",
      category: "Augment",
      before: 5.5,
      after: 2.1,
    },
    {
      label: "Month-end reconciliation review",
      category: "Augment",
      before: 4.0,
      after: 2.5,
    },
    {
      label: "Vendor relationship management",
      category: "Own",
      before: 6.0,
      after: 6.0,
    },
    {
      label: "Audit support & judgment calls",
      category: "Own",
      before: 4.0,
      after: 4.0,
    },
    {
      label: "Team mentorship",
      category: "Own",
      before: 5.0,
      after: 5.0,
    },
  ],
  pathway: [
    "AI-Augmented Finance Analyst (12-week pathway)",
    "Process Automation Lead (24-week pathway)",
    "FP&A Partner (advanced track)",
  ],
};

function PreviewEmployeeAnalysis() {
  const totalBefore = MARIA.tasks.reduce((s, t) => s + t.before, 0);
  const totalAfter = MARIA.tasks.reduce((s, t) => s + t.after, 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <PreviewBanner
        eyebrow="Sample Employee Analysis"
        title="Meet Maria. This is her week, transformed by AI."
        subtitle="Every employee gets a personal readiness report — built from the same audit data execs see."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border bg-card p-8 shadow-2xl sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand to-primary text-xl font-bold text-brand-foreground">
                MA
              </div>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">{MARIA.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {MARIA.role} · {MARIA.department} · {MARIA.tenure}
                </p>
              </div>
            </div>
            <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-warning">
              Sample data
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <BigStat
              icon={Clock}
              label="Hours recovered / week"
              value={`${MARIA.recovered}`}
              sub="From automation alone"
              tone="success"
            />
            <BigStat
              icon={TrendingUp}
              label="AI readiness score"
              value={`${MARIA.readiness}/100`}
              sub="Top quartile"
              tone="brand"
            />
            <BigStat
              icon={Sparkles}
              label="Recommended pathway"
              value="3 tracks"
              sub="Personalized"
              tone="primary"
            />
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold">
              Task-by-task breakdown
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Hours per week, before vs. after AI deployment.
            </p>
            <div className="mt-4 space-y-2">
              {MARIA.tasks.map((t) => {
                const pctAfter = Math.max(4, (t.after / t.before) * 100 || 4);
                return (
                  <div
                    key={t.label}
                    className="rounded-xl border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={t.category} />
                        <span className="text-sm font-medium">{t.label}</span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {t.before.toFixed(1)}h →{" "}
                        <span className="font-semibold text-foreground">
                          {t.after.toFixed(1)}h
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full ${
                          t.category === "Own"
                            ? "bg-primary"
                            : t.category === "Augment"
                              ? "bg-brand"
                              : "bg-success"
                        }`}
                        style={{ width: `${pctAfter}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-xs">
              <span className="text-muted-foreground">Weekly totals</span>
              <span className="font-mono">
                {totalBefore.toFixed(1)}h →{" "}
                <span className="font-semibold text-success">
                  {totalAfter.toFixed(1)}h
                </span>
              </span>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold">Recommended upskilling</h3>
            <ul className="mt-3 space-y-2">
              {MARIA.pathway.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-3 rounded-xl border bg-background p-3 text-sm"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <BottomCTA
          line="Want this for your team?"
          sub="The free audit includes a sample employee report. Takes 30 seconds."
        />
      </section>
    </div>
  );
}

function BigStat({
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sub: string;
  tone: "success" | "brand" | "primary";
}) {
  const tones = {
    success: "border-success/30 bg-success/10",
    brand: "border-brand/30 bg-brand/10",
    primary: "border-primary/30 bg-primary/10",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </div>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const tones: Record<string, string> = {
    Automate: "bg-success/15 text-success border-success/30",
    Augment: "bg-brand/15 text-brand border-brand/30",
    Own: "bg-primary/10 text-primary border-primary/20",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${tones[category]}`}
    >
      {category}
    </span>
  );
}
