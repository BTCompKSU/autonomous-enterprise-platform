import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Clock, Zap } from "lucide-react";
import { WorkflowScoreGauge } from "@/components/judging/WorkflowScoreGauge";
import { OversightPanel } from "@/components/judging/OversightPanel";
import { WorkforceImpactCard } from "@/components/judging/WorkforceImpactCard";
import { RegionalImpactCard } from "@/components/judging/RegionalImpactCard";
import { DemoTip } from "@/components/judging/DemoMode";
import { AuditCTA } from "@/components/AuditCTA";

export const Route = createFileRoute("/_authed/_admin/dashboard")({
  component: ExecutiveDashboard,
});

function ExecutiveDashboard() {
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-6 py-12">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Executive Dashboard
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Your Autonomous Workforce Score
        </h1>
        <p className="text-muted-foreground">Real-time view of enterprise AI readiness.</p>
      </header>

      <DemoTip label="Headline metric — Autonomous Workflow Score">
        <div className="grid gap-6 rounded-3xl border bg-gradient-to-br from-card to-accent/40 p-8 shadow-sm lg:grid-cols-[auto_1fr]">
          <WorkflowScoreGauge value={64} label="Enterprise-wide" size={200} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Kpi icon={Zap} label="Productivity unlocked" value="$7.5M" sub="annualized" />
            <Kpi icon={Clock} label="Capacity gained" value="8,400 hrs/mo" sub="vs. last quarter" />
            <Kpi icon={TrendingUp} label="Reliability uptrend" value="+4.2% / wk" sub="agent learning" />
            <Kpi icon={Zap} label="Tasks auto-handled" value="312K" sub="last 30 days" />
            <Kpi icon={Clock} label="Avg. task latency" value="1.8s" sub="end-to-end" />
            <Kpi icon={TrendingUp} label="Pilots → production" value="9 / 12" sub="vs. industry 18%" />
          </div>
        </div>
      </DemoTip>

      <DemoTip label="AI Confidence & Oversight controls">
        <OversightPanel />
      </DemoTip>

      <WorkforceImpactCard />

      <DemoTip label="Local + economic impact (Miami pilot)">
        <RegionalImpactCard />
      </DemoTip>

      <AuditCTA
        headline="Benchmark your enterprise"
        subline="Generate your own Autonomous Workforce Score and executive readiness report — free."
      />
    </main>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-brand" />
        {label}
      </div>
      <div className="mt-1.5 text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
