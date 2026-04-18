import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Gauge, Users } from "lucide-react";
import { WorkflowScoreGauge } from "@/components/judging/WorkflowScoreGauge";
import { WhyNowStrip } from "@/components/judging/WhyNowStrip";
import { ArchitectureFooter } from "@/components/judging/ArchitectureFooter";
import { DemoTip } from "@/components/judging/DemoMode";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_-10%,var(--color-brand)/15,transparent_55%),radial-gradient(circle_at_85%_110%,var(--color-primary)/20,transparent_50%)]" />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/40 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              <ShieldCheck className="h-3.5 w-3.5" />
              The Reliable Autonomous Workforce Platform
            </span>
            <h1 className="mt-5 text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
              From AI Pilots to{" "}
              <span className="bg-gradient-to-r from-brand to-primary bg-clip-text text-transparent">
                Reliable Autonomous Operations
              </span>
              .
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              UpSkill USA tells enterprises{" "}
              <span className="font-medium text-foreground">where to deploy AI</span>,{" "}
              <span className="font-medium text-foreground">what it should do</span>,{" "}
              <span className="font-medium text-foreground">how to deploy it safely</span>, and{" "}
              <span className="font-medium text-foreground">how to transition workers</span> — all
              with measurable ROI.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
              >
                See Your Autonomous Workforce Score
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/opportunity"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-accent"
              >
                Run Enterprise AI Readiness Audit
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-3 text-sm">
              <Trust icon={Gauge} label="1.8% error rate" />
              <Trust icon={ShieldCheck} label="90% reliability threshold" />
              <Trust icon={Users} label="0 jobs displaced" />
            </div>
          </div>

          <DemoTip label="Headline metric — Autonomous Workflow Score">
            <div className="rounded-3xl border bg-card p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Live Preview
                  </div>
                  <div className="text-lg font-semibold">Autonomous Workflow Score</div>
                </div>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                  Above 60% = Autonomous Enterprise
                </span>
              </div>
              <div className="mt-4 flex items-center justify-around">
                <WorkflowScoreGauge value={68} label="Finance" />
                <WorkflowScoreGauge value={62} label="Customer Service" />
              </div>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                % of workflows that run end-to-end with minimal human intervention.
              </p>
            </div>
          </DemoTip>
        </div>
      </section>

      <WhyNowStrip />

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          The four pillars
        </div>
        <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          A complete operating system for enterprise AI deployment.
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Where to deploy", "Opportunity mapping across every department."],
            ["What AI should do", "Task-level automation clarity, not vague agents."],
            ["How to deploy safely", "Confidence scoring + human-in-the-loop."],
            ["How to transition workers", "Upskilling pathways with measurable ROI."],
          ].map(([t, b], i) => (
            <div key={t} className="rounded-2xl border bg-card p-6 shadow-sm">
              <div className="text-xs font-mono text-brand">0{i + 1}</div>
              <h3 className="mt-2 text-base font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{b}</p>
            </div>
          ))}
        </div>
      </section>

      <ArchitectureFooter />
    </main>
  );
}

function Trust({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-2">
      <Icon className="h-4 w-4 text-brand" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
