import { createFileRoute } from "@tanstack/react-router";

import { PreviewBanner, BottomCTA } from "./preview.executive-audit";
import { Bot, ShieldCheck, Workflow, Zap, Users } from "lucide-react";

export const Route = createFileRoute("/preview/agent-builder")({
  head: () => ({
    meta: [
      { title: "Sample Agent Builder — UpSkill USA" },
      {
        name: "description",
        content:
          "See how AI agents are configured with confidence thresholds, human-in-the-loop oversight, and clear scope before they ever touch production work.",
      },
      { property: "og:title", content: "Sample Agent Builder — UpSkill USA" },
      {
        property: "og:description",
        content:
          "Preview the Agent Builder: scope, governance, confidence routing. Free audit configures one for you.",
      },
    ],
  }),
  component: PreviewAgentBuilder,
});

const AGENT = {
  name: "Invoice Triage Agent",
  workflow: "Accounts Payable",
  status: "Active (sample)",
  confidence: 94,
  threshold: 85,
  weeklyVolume: 1240,
  autoHandled: 1083,
  routedToHuman: 157,
  hoursSaved: 17.8,
  scope: [
    "Extract vendor, amount, line items, and PO from inbound invoices",
    "Validate against PO and 3-way match rules",
    "Flag duplicates, suspicious totals, and missing fields",
    "Route exceptions to human reviewer with summary",
  ],
  outOfScope: [
    "Approving payments above $25,000",
    "Resolving vendor disputes",
    "Onboarding new vendors (handed to KYC flow)",
  ],
  oversight: [
    { label: "Min confidence to auto-act", value: "85%" },
    { label: "Human review SLA", value: "< 4 hours" },
    { label: "Audit log retention", value: "7 years" },
    { label: "Override authority", value: "Finance Manager" },
  ],
};

function PreviewAgentBuilder() {
  return (
    <div className="min-h-screen bg-background">
      
      <PreviewBanner
        eyebrow="Sample Agent Builder"
        title="Every AI agent ships with guardrails."
        subtitle="Scope, confidence thresholds, and human override — configured before deployment."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border bg-card p-8 shadow-2xl sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand to-primary text-brand-foreground">
                <Bot className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">{AGENT.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {AGENT.workflow} ·{" "}
                  <span className="text-success">{AGENT.status}</span>
                </p>
              </div>
            </div>
            <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-warning">
              Sample data
            </span>
          </div>

          {/* Live metrics */}
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            <Metric
              icon={Zap}
              label="Avg confidence"
              value={`${AGENT.confidence}%`}
              tone="success"
            />
            <Metric
              icon={Workflow}
              label="Volume / week"
              value={`${AGENT.weeklyVolume.toLocaleString()}`}
              tone="brand"
            />
            <Metric
              icon={Bot}
              label="Auto-handled"
              value={`${AGENT.autoHandled.toLocaleString()}`}
              tone="primary"
            />
            <Metric
              icon={Users}
              label="Routed to human"
              value={`${AGENT.routedToHuman}`}
              tone="muted"
            />
          </div>

          {/* Confidence visual */}
          <div className="mt-6 rounded-2xl border bg-gradient-to-br from-brand/10 via-card to-primary/10 p-6">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <span>Confidence routing</span>
              <span>Threshold {AGENT.threshold}%</span>
            </div>
            <div className="relative mt-3 h-3 overflow-hidden rounded-full bg-muted">
              <div
                className="absolute inset-y-0 left-0 bg-success/40"
                style={{ width: `${AGENT.threshold}%` }}
              />
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground"
                style={{ left: `${AGENT.threshold}%` }}
              />
              <div
                className="absolute top-0 h-full w-1.5 bg-success"
                style={{ left: `${AGENT.confidence}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] text-muted-foreground">
              <span>Route to human ←</span>
              <span>→ Auto-act</span>
            </div>
            <p className="mt-3 text-sm text-foreground/80">
              Anything below <strong>{AGENT.threshold}%</strong> confidence is
              automatically routed to a human reviewer. The current rolling
              average is{" "}
              <strong className="text-success">{AGENT.confidence}%</strong>.
            </p>
          </div>

          {/* Scope */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <ScopeCard
              title="In scope"
              items={AGENT.scope}
              tone="success"
            />
            <ScopeCard
              title="Out of scope"
              items={AGENT.outOfScope}
              tone="muted"
            />
          </div>

          {/* Oversight */}
          <div className="mt-8 rounded-2xl border bg-background p-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-brand" />
              <h3 className="text-base font-semibold">Governance & oversight</h3>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {AGENT.oversight.map((o) => (
                <div
                  key={o.label}
                  className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{o.label}</span>
                  <span className="font-semibold">{o.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-success-foreground">
            <strong className="text-success">Estimated impact:</strong>{" "}
            {AGENT.hoursSaved} hours recovered per week per AP specialist —
            redirected into vendor relationships and audit support.
          </div>
        </div>

        <BottomCTA
          line="Build your first agent in a free audit."
          sub="We pre-configure the scope and guardrails for your highest-impact workflow."
        />
      </section>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Bot;
  label: string;
  value: string;
  tone: "success" | "brand" | "primary" | "muted";
}) {
  const tones = {
    success: "border-success/30 bg-success/10 text-success",
    brand: "border-brand/30 bg-brand/10 text-brand",
    primary: "border-primary/30 bg-primary/10 text-primary",
    muted: "border-border bg-muted text-foreground",
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider opacity-80">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function ScopeCard({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "success" | "muted";
}) {
  const tones = {
    success: "border-success/30 bg-success/5",
    muted: "border-border bg-muted/30",
  };
  return (
    <div className={`rounded-2xl border p-5 ${tones[tone]}`}>
      <h4 className="text-sm font-semibold uppercase tracking-wider">
        {title}
      </h4>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span
              className={tone === "success" ? "text-success" : "text-muted-foreground"}
            >
              {tone === "success" ? "✓" : "✗"}
            </span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
