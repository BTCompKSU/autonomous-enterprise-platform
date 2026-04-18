import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, ArrowRight } from "lucide-react";
import { WorkflowScoreGauge } from "@/components/judging/WorkflowScoreGauge";
import { DemoTip } from "@/components/judging/DemoMode";

export const Route = createFileRoute("/opportunity")({
  component: OpportunityMap,
});

const departments = [
  { name: "Finance", score: 68, opps: 14, unlocked: "$2.4M", capacity: "1,800 hrs/mo" },
  { name: "Customer Service", score: 62, opps: 22, unlocked: "$1.9M", capacity: "2,400 hrs/mo" },
  { name: "Operations", score: 54, opps: 18, unlocked: "$1.2M", capacity: "1,600 hrs/mo" },
  { name: "HR", score: 48, opps: 9, unlocked: "$640K", capacity: "720 hrs/mo" },
  { name: "Legal", score: 41, opps: 7, unlocked: "$520K", capacity: "560 hrs/mo" },
  { name: "Marketing", score: 58, opps: 12, unlocked: "$880K", capacity: "1,100 hrs/mo" },
];

function OpportunityMap() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="flex flex-col gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Screen 02 — Opportunity Map
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Where can AI deliver reliable value, today?
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Every department scored on its <strong>Autonomous Workflow Score</strong> — the % of work
          that can run end-to-end with minimal human intervention.
        </p>
      </header>

      <DemoTip label="Per-department Autonomous Workflow Score" className="mt-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <div
              key={d.name}
              className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">{d.name}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <WorkflowScoreGauge value={d.score} size={120} />
                <div className="space-y-2 text-right text-sm">
                  <Row label="Opportunities" value={`${d.opps}`} />
                  <Row label="Productivity unlocked" value={d.unlocked} />
                  <Row label="Capacity gained" value={d.capacity} />
                </div>
              </div>
              <Link
                to="/skill-module"
                className="mt-4 inline-flex items-center justify-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition hover:bg-accent"
              >
                Explore agents <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </DemoTip>

      <div className="mt-10 rounded-2xl border bg-accent/40 p-6">
        <p className="text-sm">
          <span className="font-semibold">Companies above 60% operate as Autonomous Enterprises.</span>{" "}
          You're 2 departments away.
        </p>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
