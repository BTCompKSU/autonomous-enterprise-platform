import { createFileRoute, Link } from "@tanstack/react-router";

import { WorkforceScoreScale } from "@/components/WorkforceScoreScale";
import {
  ArrowRight,
  Sparkles,
  Users,
  Clock,
  TrendingDown,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from "lucide-react";

export const Route = createFileRoute("/preview/executive-audit")({
  head: () => ({
    meta: [
      { title: "Sample Executive Audit — UpSkill USA" },
      {
        name: "description",
        content:
          "Preview a sample AI Readiness Diagnostic: cost of inaction, 5-year competitive gap, and the operational work hiding inside your organization — generated for any company in 30 seconds.",
      },
      { property: "og:title", content: "Sample Executive Audit — UpSkill USA" },
      {
        property: "og:description",
        content:
          "See the dollar value of inaction at a sample mid-market firm. Then run yours free in 30 seconds.",
      },
    ],
  }),
  component: PreviewExecutiveAudit,
});

// Mirrors a real CostModel + AuditReport for "Northwind Financial Services".
// Math: 480 employees × 0.55 addressable × 22% automatable hours × $89k loaded.
const SAMPLE = {
  company_name: "Northwind Financial Services",
  website: "northwind-financial.com",
  industry: "Mid-Market Finance",
  size_estimate: "~480 employees",
  score: 73,
  score_rationale:
    "Northwind has heavy exposure to repetitive, rules-based document workflows (invoices, reconciliations, claims). Customer-facing roles remain best suited for human ownership, which keeps the score from peaking — but the addressable base is among the largest in its segment.",
  executive_summary:
    "Across Finance, Operations, and Customer Support, Northwind is sitting on roughly 14,200 weekly hours of structured, rule-based work. Every week it remains manual is measurable lost margin — and a widening gap against competitors already deploying AI inside the same workflows.",
  cost_model: {
    employees: 480,
    employee_source: "exact" as const,
    addressable_roles: 264,
    industry_label: "Financial Services",
    weekly_hours_reclaimable: 2_323,
    annual_hours_reclaimable: 116_160,
    annual_value_at_risk: 4_780_000,
    five_year_cost_of_inaction: 27_490_000,
    fully_loaded_cost_per_role: 89_000,
    pain_hours_per_year: [38_400, 24_500, 19_800, 12_400],
  },
  pain_categories: [
    {
      department: "Finance",
      symptom: "Manual invoice processing, 3-way matching, and reconciliations",
    },
    {
      department: "Operations",
      symptom: "Claims triage and document review handled line-by-line",
    },
    {
      department: "Customer Support",
      symptom: "Tier-1 policy and status questions answered manually",
    },
    {
      department: "Procurement",
      symptom: "Vendor onboarding, KYC collection, and risk scoring done by hand",
    },
  ],
};

function formatUsdShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}
function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function PreviewExecutiveAudit() {
  const cm = SAMPLE.cost_model;
  return (
    <div className="min-h-screen bg-background">
      <PreviewBanner
        eyebrow="Sample Executive Audit"
        title="This is what executives see in 30 seconds."
        subtitle="A live audit on your own company URL is free — no credit card, no spam."
      />

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="border-b border-slate-100 p-8 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B1F3B]">
                  AI Readiness Diagnostic
                </div>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                  {SAMPLE.company_name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {SAMPLE.website} · {SAMPLE.industry} · {SAMPLE.size_estimate}
                </p>
              </div>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                Sample data
              </span>
            </div>
          </div>

          {/* THE COST OF INACTION — hero */}
          <div className="relative overflow-hidden bg-[#0B1F3B] p-8 text-white sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#F5C84C]">
                <TrendingDown className="h-3.5 w-3.5" />
                Annual Cost of Inaction
              </div>
              <div className="mt-3 flex items-baseline gap-3 leading-none">
                <div className="text-6xl font-extrabold tracking-tight sm:text-7xl">
                  {formatUsdShort(cm.annual_value_at_risk)}
                </div>
                <div className="text-sm text-white/60">/year</div>
              </div>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75">
                in fully-loaded labor value locked inside repeatable, addressable work at{" "}
                {SAMPLE.company_name} — every year you wait.
              </p>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                <DarkStat
                  icon={<Users className="h-3.5 w-3.5" />}
                  label="Employees"
                  value={formatNumber(cm.employees)}
                  hint="verified"
                />
                <DarkStat
                  icon={<Users className="h-3.5 w-3.5" />}
                  label="Addressable roles"
                  value={formatNumber(cm.addressable_roles)}
                  hint={cm.industry_label}
                />
                <DarkStat
                  icon={<Clock className="h-3.5 w-3.5" />}
                  label="Recoverable / week"
                  value={`${formatNumber(cm.weekly_hours_reclaimable)} hrs`}
                  hint={`${formatNumber(cm.annual_hours_reclaimable)} hrs/yr`}
                />
              </div>
            </div>
          </div>

          {/* 5-year competitive gap */}
          <div className="border-b border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-6 sm:px-10">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-800">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  5-Year Competitive Gap
                </div>
                <p className="mt-1 text-sm text-slate-700">
                  Cumulative value lost if competitors deploy AI before you do.
                </p>
              </div>
              <div className="text-3xl font-extrabold tracking-tight text-[#0B1F3B] sm:text-4xl">
                {formatUsdShort(cm.five_year_cost_of_inaction)}
              </div>
            </div>
          </div>

          {/* Score + summary */}
          <div className="p-8 sm:p-10">
            <div className="grid gap-6 sm:grid-cols-[auto_1fr]">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Workforce Score
                </div>
                <div className="mt-1 text-5xl font-extrabold leading-none text-[#0B1F3B]">
                  {SAMPLE.score}
                  <span className="text-lg text-slate-400">/100</span>
                </div>
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Executive Summary</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-700">
                  {SAMPLE.executive_summary}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  {SAMPLE.score_rationale}
                </p>
              </div>
            </div>
            <WorkforceScoreScale score={SAMPLE.score} />
          </div>

          {/* Pain categories */}
          <div className="border-t border-slate-100 px-8 pb-8 pt-6 sm:px-10 sm:pb-10">
            <h3 className="text-base font-semibold text-slate-900">
              What's hiding in your operations
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              High-volume manual work surfaced from your industry, size, and tech stack signals.
            </p>
            <div className="mt-4 grid gap-3">
              {SAMPLE.pain_categories.map((p, i) => (
                <div
                  key={`${p.department}-${i}`}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-[#0B1F3B]/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0B1F3B]">
                        {p.department}
                      </div>
                      <p className="mt-1.5 text-sm font-medium text-slate-800">{p.symptom}</p>
                    </div>
                    <div className="shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-right">
                      <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700">
                        Trapped
                      </div>
                      <div className="text-sm font-bold text-[#0B1F3B]">
                        ~{formatNumber(cm.pain_hours_per_year[i] ?? 0)} hrs/yr
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Locked CTA */}
          <div className="relative overflow-hidden border-t border-slate-100 bg-gradient-to-br from-[#0B1F3B] via-[#13294f] to-[#0B1F3B] p-8 sm:p-10">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#F5C84C]/20 blur-3xl"
            />
            <div className="relative flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#F5C84C]/40 bg-[#F5C84C]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F5C84C]">
                  <Lock className="h-3 w-3" />
                  Your roadmap is ready
                </div>
                <h3 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-[28px]">
                  Sign up to unlock your deployment plan.
                </h3>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  <LockedItem>
                    Role-by-role automation map for {SAMPLE.company_name}
                  </LockedItem>
                  <LockedItem>90-day pilot plan with prioritized workflows</LockedItem>
                  <LockedItem>ROI projections by department and quarter</LockedItem>
                </ul>
              </div>
              <Link
                to="/signup"
                className="group inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5C84C] px-7 text-base font-bold tracking-tight text-[#0B1F3B] shadow-lg shadow-black/30 transition hover:brightness-105"
              >
                Create your account
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Methodology */}
          <div className="border-t border-slate-100 bg-slate-50 px-8 py-4 text-[11px] leading-relaxed text-slate-500 sm:px-10">
            <span className="font-semibold text-slate-700">Methodology:</span> figures derived from
            verified headcount × industry-standard fully-loaded labor cost (BLS 2023, $
            {formatNumber(cm.fully_loaded_cost_per_role)}/role) × automatable-work share for{" "}
            {cm.industry_label} (McKinsey, 2023). 5-year figure compounded for competitive
            productivity gap.
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

function DarkStat({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/55">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-lg font-bold text-white">{value}</div>
      <div className="text-[11px] text-white/50">{hint}</div>
    </div>
  );
}

function LockedItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5C84C]" />
      <span>{children}</span>
    </li>
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
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
          >
            Get my free audit
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BottomCTA({ line, sub }: { line: string; sub: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-card p-8 text-center shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{line}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{sub}</p>
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
