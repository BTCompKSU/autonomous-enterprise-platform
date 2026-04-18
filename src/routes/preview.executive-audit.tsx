import { createFileRoute, Link } from "@tanstack/react-router";

import { ArrowRight, Sparkles, TrendingUp, Building2, Users, Clock, DollarSign } from "lucide-react";

export const Route = createFileRoute("/preview/executive-audit")({
  head: () => ({
    meta: [
      { title: "Sample Executive Audit — UpSkill USA" },
      {
        name: "description",
        content:
          "See a sample AI Opportunity Audit: workforce score, top automation opportunities, ROI projections, and risks — generated for any company in 30 seconds.",
      },
      { property: "og:title", content: "Sample Executive Audit — UpSkill USA" },
      {
        property: "og:description",
        content:
          "Preview a real AI Opportunity Audit. Then run yours free in 30 seconds.",
      },
    ],
  }),
  component: PreviewExecutiveAudit,
});

const SAMPLE = {
  company: "Northwind Financial Services",
  industry: "Mid-Market Finance",
  size: "~480 employees",
  score: 73,
  rationale:
    "Northwind has heavy exposure to repetitive, rules-based document workflows (invoices, reconciliations, claims) — making it a top-quartile candidate for AI augmentation. Customer-facing roles remain best suited for human ownership.",
  summary:
    "Across Finance, Operations, and Customer Support, Northwind has ~14,200 weekly hours of structured, rule-based work. Deploying AI across the top 5 workflows alone unlocks an estimated $6.7M in annualized value while creating a clear upskilling path for 38 affected roles.",
  opportunities: [
    {
      title: "Invoice processing & 3-way match",
      department: "Finance",
      impact: "High",
      effort: "Low",
      hours: 1240,
      description:
        "Automate extraction, validation, and PO matching for inbound invoices. Confidence-scored routing for exceptions.",
    },
    {
      title: "Claims triage & document review",
      department: "Operations",
      impact: "High",
      effort: "Medium",
      hours: 980,
      description:
        "Pre-classify, summarize, and route claim packets. Adjusters review only flagged exceptions.",
    },
    {
      title: "Tier-1 customer support deflection",
      department: "Customer Support",
      impact: "Medium",
      effort: "Low",
      hours: 760,
      description:
        "AI agent answers policy + status questions with full audit trail. Hands off to human agent above complexity threshold.",
    },
    {
      title: "Vendor onboarding & KYC",
      department: "Procurement",
      impact: "Medium",
      effort: "Medium",
      hours: 410,
      description:
        "Document collection, verification, and risk scoring with human approval at the final step.",
    },
  ],
  risks: [
    "Change management resistance from middle managers",
    "Underinvestment in employee upskilling pathways",
    "Lack of governance thresholds on AI decisions",
  ],
  roi: { value: "$6.7M", cost: "$42.5K", multiple: "157x" },
};

function PreviewExecutiveAudit() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <PreviewBanner
        eyebrow="Sample Executive Audit"
        title="This is what executives see in 30 seconds."
        subtitle="A live audit on your own company URL is free — no credit card, no spam."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="rounded-3xl border bg-card p-8 shadow-2xl sm:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                AI Readiness Audit
              </div>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">
                {SAMPLE.company}
              </h2>
              <p className="text-sm text-muted-foreground">
                {SAMPLE.industry} · {SAMPLE.size}
              </p>
            </div>
            <span className="rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-warning">
              Sample data
            </span>
          </div>

          <div className="mt-6 grid gap-6 rounded-2xl border bg-gradient-to-br from-brand/10 via-card to-primary/10 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="text-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Autonomous Workforce Score
              </div>
              <div className="mt-1 text-7xl font-extrabold leading-none text-primary">
                {SAMPLE.score}
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
            </div>
            <p className="text-sm text-foreground/80">{SAMPLE.rationale}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <Stat icon={DollarSign} label="Annual value" value={SAMPLE.roi.value} tone="success" />
            <Stat icon={Building2} label="Platform cost" value={SAMPLE.roi.cost} tone="muted" />
            <Stat icon={TrendingUp} label="ROI" value={SAMPLE.roi.multiple} tone="brand" />
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold">Executive Summary</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {SAMPLE.summary}
            </p>
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold">
              Top AI Deployment Opportunities
            </h3>
            <div className="mt-3 grid gap-3">
              {SAMPLE.opportunities.map((o) => (
                <div key={o.title} className="rounded-xl border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-semibold">{o.title}</div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Pill tone="brand">{o.department}</Pill>
                      <Pill tone={o.impact === "High" ? "success" : "muted"}>
                        {o.impact} impact
                      </Pill>
                      <Pill tone={o.effort === "Low" ? "success" : "muted"}>
                        {o.effort} effort
                      </Pill>
                      <Pill tone="primary">~{o.hours} hrs/yr</Pill>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {o.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-base font-semibold">Risks to Watch</h3>
            <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
              {SAMPLE.risks.map((r) => (
                <li key={r} className="flex gap-2">
                  <span className="text-warning">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <BottomCTA
          line="Ready to see this for your company?"
          sub="Free audit. 30 seconds. No credit card."
        />
      </section>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  tone: "success" | "brand" | "muted";
}) {
  const tones = {
    success: "text-success bg-success/10 border-success/30",
    brand: "text-brand bg-brand/10 border-brand/30",
    muted: "text-foreground bg-muted border-border",
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

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "brand" | "primary" | "success" | "muted";
}) {
  const tones: Record<string, string> = {
    brand: "bg-brand/15 text-brand border-brand/30",
    primary: "bg-primary/10 text-primary border-primary/20",
    success: "bg-success/15 text-success border-success/30",
    muted: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function PreviewBanner({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <section className="border-b bg-gradient-to-b from-card/50 to-background">
      <div className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
          <Sparkles className="h-3.5 w-3.5" />
          {eyebrow}
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/opportunity"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
          >
            Get my free audit
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BottomCTA({ line, sub }: { line: string; sub: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-card p-8 text-center shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
        {line}
      </h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
        {sub}
      </p>
      <div className="mt-5">
        <Link
          to="/opportunity"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Sparkles className="h-4 w-4" />
          Get my free audit
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// Re-export for sibling preview routes (avoids duplicate code).
export { Users, Clock };
