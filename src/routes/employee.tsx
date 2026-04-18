import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap, TrendingUp, Award } from "lucide-react";
import { ConfidenceBadge } from "@/components/judging/ConfidenceBadge";
import { WorkforceImpactCard } from "@/components/judging/WorkforceImpactCard";
import { DemoTip } from "@/components/judging/DemoMode";
import { AuditCTA } from "@/components/AuditCTA";

export const Route = createFileRoute("/employee")({
  component: EmployeeReport,
});

const routedTasks = [
  { name: "Vendor risk: Acme Corp", confidence: 72 },
  { name: "Exception: Duplicate invoice #4291", confidence: 64 },
  { name: "New supplier onboarding", confidence: 81 },
];

const autoTasks = [
  { name: "Invoice classification batch", confidence: 98 },
  { name: "Routine PO match", confidence: 96 },
];

function EmployeeReport() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Screen 04 — Employee Report
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Maria Hernández</h1>
          <p className="text-muted-foreground">AP Analyst → AI Operations Lead (in progress)</p>
        </div>
        <div className="flex gap-2">
          <Pill icon={Award} label="Promotion track" />
          <Pill icon={GraduationCap} label="2 certifications earned" />
          <Pill icon={TrendingUp} label="+38% capacity" />
        </div>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <DemoTip label="Confidence-based routing in action">
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Tasks routed to Maria today</h2>
            <p className="text-sm text-muted-foreground">
              Below the 90% threshold → human review.
            </p>
            <div className="mt-4 divide-y">
              {routedTasks.map((t) => (
                <div key={t.name} className="flex items-center justify-between py-3">
                  <span className="text-sm">{t.name}</span>
                  <ConfidenceBadge score={t.confidence} reviewer="Maria" />
                </div>
              ))}
            </div>
          </div>
        </DemoTip>

        <div className="rounded-2xl border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Auto-approved by AI</h2>
          <p className="text-sm text-muted-foreground">High confidence → no human needed.</p>
          <div className="mt-4 divide-y">
            {autoTasks.map((t) => (
              <div key={t.name} className="flex items-center justify-between py-3">
                <span className="text-sm">{t.name}</span>
                <ConfidenceBadge score={t.confidence} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <WorkforceImpactCard />
      </div>

      <div className="mt-6 rounded-2xl border bg-gradient-to-br from-brand/15 to-accent p-6">
        <h3 className="text-base font-semibold">Maria's path</h3>
        <p className="mt-1 text-sm text-foreground">
          AI didn't replace Maria — it removed the repetitive 78% of her job, freeing her to lead AI
          oversight for AP. Her role transformed; her seniority increased.
        </p>
      </div>

      <AuditCTA
        className="mt-8"
        headline="See how AI will reshape your workforce"
        subline="Get a free analysis of which roles transform, which scale, and where new opportunities open up."
      />
    </main>
  );
}

function Pill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium">
      <Icon className="h-3.5 w-3.5 text-brand" />
      {label}
    </span>
  );
}
