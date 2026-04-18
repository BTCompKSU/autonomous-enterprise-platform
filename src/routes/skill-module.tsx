import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { ConfidenceBadge } from "@/components/judging/ConfidenceBadge";
import { AgentDeploymentBuilder } from "@/components/judging/AgentDeploymentBuilder";
import { DemoTip } from "@/components/judging/DemoMode";

export const Route = createFileRoute("/skill-module")({
  component: SkillModule,
});

const tasks = [
  { id: 1, name: "Invoice classification", confidence: 98, owner: "AI Agent" },
  { id: 2, name: "PO matching (3-way)", confidence: 94, owner: "AI Agent" },
  { id: 3, name: "Vendor risk scoring", confidence: 72, owner: "Maria (Reviewer)" },
  { id: 4, name: "Approval routing", confidence: 96, owner: "AI Agent" },
  { id: 5, name: "Exception handling", confidence: 64, owner: "Maria (Reviewer)" },
];

function SkillModule() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Screen 03 — Skill Module
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Finance · Accounts Payable Skill
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A composable, deployable agent unit. Every task carries a confidence score; low-confidence
          work is automatically routed to a human.
        </p>
      </header>

      <DemoTip label="Production-ready agent flow with confidence checks" className="mt-10">
        <AgentDeploymentBuilder />
      </DemoTip>

      <section className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Task-level confidence (last 24h)</h2>
        <p className="text-sm text-muted-foreground">
          Threshold: 90%. Below threshold → routed to a named human reviewer.
        </p>
        <div className="mt-5 divide-y">
          {tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-4 py-3">
              <div className="w-6 text-xs font-mono text-muted-foreground">#{t.id}</div>
              <div className="flex-1">
                <div className="font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">Owner: {t.owner}</div>
              </div>
              <ConfidenceBadge score={t.confidence} />
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <Link
          to="/employee"
          className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          See impact on a worker <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
