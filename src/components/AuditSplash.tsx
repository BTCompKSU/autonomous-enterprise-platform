import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { WorkforceScoreScale } from "@/components/WorkforceScoreScale";
import {
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Sparkles,
  ShieldCheck,
  Globe,
  TrendingDown,
  Lock,
  Users,
  Clock,
  AlertTriangle,
  Printer,
} from "lucide-react";
import { generateAudit } from "@/lib/audit.functions";
import type { AuditReport } from "@/lib/audit-types";
import { formatNumber, formatUsdShort } from "@/lib/cost-model";
import { toast } from "sonner";

type Step = "website" | "email" | "loading" | "report";

export function AuditSplash() {
  const generateAuditFn = useServerFn(generateAudit);
  const [step, setStep] = useState<Step>("website");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [audit, setAudit] = useState<AuditReport | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onWebsiteSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = website.trim();
    if (!/\./.test(trimmed) || trimmed.length < 3) {
      toast.error("Enter a valid website (e.g. acme.com)");
      return;
    }
    setStep("email");
  }

  async function onEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setStep("loading");
    setError(null);
    try {
      const result = await generateAuditFn({ data: { website, email } });
      if (!result.ok) {
        setError(result.error);
        setStep("email");
        toast.error(result.error);
        return;
      }
      setAudit(result.audit);
      setLeadId(result.lead_id);
      setEmailSent(result.email_sent);
      setStep("report");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      setStep("email");
      toast.error(msg);
    }
  }

  function reset() {
    setStep("website");
    setWebsite("");
    setEmail("");
    setAudit(null);
    setLeadId(null);
    setEmailSent(false);
    setError(null);
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#0B1F3B] text-white print:bg-white print:text-slate-900">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 print:hidden"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 110%, rgba(245,200,76,0.10), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06] print:hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28 lg:py-32 print:max-w-none print:p-0 print:py-0">
        <div className="flex justify-center print:hidden">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C84C]/40 bg-[#F5C84C]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F5C84C]">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise AI Readiness Audit
          </span>
        </div>

        <h1 className="mx-auto mt-7 max-w-3xl text-center text-4xl font-semibold leading-[1.08] tracking-[-0.015em] text-white sm:text-5xl lg:text-[64px] print:hidden">
          Identify where AI can{" "}
          <span className="text-[#F5C84C]">transform operations</span>{" "}
          across your company.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/70 sm:text-lg print:hidden">
          Enter your company URL to generate a real-time audit of AI-ready workflows,
          operational gaps, and automation opportunities across your organization.
        </p>

        <div className="mx-auto mt-12 max-w-2xl print:mt-0 print:max-w-none">
          {step === "website" && (
            <form onSubmit={onWebsiteSubmit} className="group relative">
              <div className="absolute -inset-1 rounded-2xl bg-[#F5C84C]/20 opacity-40 blur-xl transition group-focus-within:opacity-70" />
              <div className="relative flex flex-col gap-2 rounded-2xl border border-white/10 bg-white p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 px-5">
                  <Globe className="h-5 w-5 shrink-0 text-slate-400" />
                  <input
                    autoFocus
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="yourcompany.com"
                    className="h-16 w-full bg-transparent text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex h-16 items-center justify-center gap-2 rounded-xl bg-[#0B1F3B] px-7 text-base font-semibold tracking-tight text-white shadow-lg shadow-black/30 transition hover:bg-[#0B1F3B]/90 hover:brightness-110"
                >
                  Get Your AI Readiness Audit
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {step === "email" && (
            <form onSubmit={onEmailSubmit} className="group relative">
              <div className="absolute -inset-1 rounded-2xl bg-[#F5C84C]/20 opacity-40 blur-xl transition group-focus-within:opacity-70" />
              <div className="relative rounded-2xl border border-white/10 bg-white p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:p-8">
                <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Auditing <span className="font-mono font-medium text-slate-900">{website}</span>
                  <button
                    type="button"
                    onClick={() => setStep("website")}
                    className="ml-auto text-xs text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
                  >
                    change
                  </button>
                </div>
                <label className="text-base font-semibold tracking-tight text-slate-900">
                  Where should we send your report?
                </label>
                <p className="mt-1.5 text-sm text-slate-500">
                  Your audit appears on this page and a copy is delivered to your inbox.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-5">
                    <Mail className="h-5 w-5 shrink-0 text-slate-400" />
                    <input
                      autoFocus
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-16 w-full bg-transparent text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-16 items-center justify-center gap-2 rounded-xl bg-[#0B1F3B] px-7 text-base font-semibold tracking-tight text-white shadow-lg shadow-black/30 transition hover:bg-[#0B1F3B]/90 hover:brightness-110"
                  >
                    Deliver My Report
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {error && <div className="mt-3 text-sm text-destructive">{error}</div>}
                <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Enterprise-grade privacy. We never share or sell your information.
                </div>
              </div>
            </form>
          )}

          {step === "loading" && (
            <div className="rounded-2xl border border-white/10 bg-white p-10 text-center shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0B1F3B]" />
              <h3 className="mt-4 text-xl font-semibold tracking-tight text-slate-900">
                Analyzing {website}…
              </h3>
              <ul className="mx-auto mt-6 max-w-sm space-y-2.5 text-left text-sm text-slate-600">
                <LoadingStep label="Scanning your website" delay={0} />
                <LoadingStep label="Enriching with company intelligence" delay={1} />
                <LoadingStep label="Calculating addressable workforce" delay={2} />
                <LoadingStep label="Modeling annual cost of inaction" delay={3} />
              </ul>
            </div>
          )}

          {step === "report" && audit && (
            <AuditReportCard
              audit={audit}
              website={website}
              email={email}
              leadId={leadId}
              emailSent={emailSent}
              onReset={reset}
            />
          )}
        </div>

        {step !== "report" && (
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <Trust label="30-second audit" />
            <Trust label="No credit card required" />
            <Trust label="Enterprise-grade security" />
          </div>
        )}
      </div>
    </section>
  );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
  return (
    <li
      className="flex items-center gap-2.5 opacity-0 [animation-fill-mode:forwards]"
      style={{
        animation: `fadeIn 400ms ease-out ${delay * 600}ms forwards`,
      }}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#0B1F3B]/30 bg-[#0B1F3B]/5 text-[10px] font-bold text-[#0B1F3B]">
        {delay + 1}
      </span>
      {label}
      <style>{`@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(4px); } }`}</style>
    </li>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
      <CheckCircle2 className="h-4 w-4 text-[#F5C84C]" />
      <span className="text-xs font-medium tracking-wide text-white/85">{label}</span>
    </div>
  );
}

function AuditReportCard({
  audit,
  website,
  email,
  leadId,
  emailSent,
  onReset,
}: {
  audit: AuditReport;
  website: string;
  email: string;
  leadId: string | null;
  emailSent: boolean;
  onReset: () => void;
}) {
  const score = Math.round(audit.autonomous_workforce_score);
  const cm = audit.cost_model;
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="border-b border-slate-100 p-8 sm:p-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0B1F3B]">
              AI Readiness Diagnostic
            </div>
            <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
              {audit.company_name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {website} · {audit.industry} · {audit.size_estimate}
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
          >
            Run another
          </button>
        </div>
        {emailSent && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            <Mail className="h-3.5 w-3.5" /> A copy was emailed to {email}
          </div>
        )}
      </div>

      {/* THE COST OF INACTION — the hero number */}
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
            {audit.company_name} — every year you wait.
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            <Stat
              icon={<Users className="h-3.5 w-3.5" />}
              label="Employees"
              value={formatNumber(cm.employees)}
              hint={cm.employee_source === "exact" ? "verified" : "estimated"}
            />
            <Stat
              icon={<Users className="h-3.5 w-3.5" />}
              label="Addressable roles"
              value={formatNumber(cm.addressable_roles)}
              hint={cm.industry_label}
            />
            <Stat
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
      <div className="grid gap-6 p-8 sm:grid-cols-[auto_1fr] sm:p-10">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-center">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Workforce Score
          </div>
          <div className="mt-1 text-5xl font-extrabold leading-none text-[#0B1F3B]">
            {score}
            <span className="text-lg text-slate-400">/100</span>
          </div>
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-900">Executive Summary</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{audit.executive_summary}</p>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">{audit.score_rationale}</p>
        </div>
      </div>
      <div className="px-8 pb-6 sm:px-10">
        <WorkforceScoreScale score={score} />
      </div>

      {/* Pain categories — name the wound, not the bandage */}
      <div className="border-t border-slate-100 px-8 pb-8 pt-6 sm:px-10 sm:pb-10">
        <h3 className="text-base font-semibold text-slate-900">
          What's hiding in your operations
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          High-volume manual work surfaced from your industry, size, and tech stack signals.
        </p>
        <div className="mt-4 grid gap-3">
          {audit.pain_categories.map((p, i) => (
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
              <LockedItem>Role-by-role automation map for {audit.company_name}</LockedItem>
              <LockedItem>90-day pilot plan with prioritized workflows</LockedItem>
              <LockedItem>ROI projections by department and quarter</LockedItem>
            </ul>
          </div>
          <Link
            to="/signup"
            search={{ from: "audit", lead: leadId ?? undefined } as never}
            className="group inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#F5C84C] px-7 text-base font-bold tracking-tight text-[#0B1F3B] shadow-lg shadow-black/30 transition hover:brightness-105"
          >
            Create your account
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Methodology footer */}
      <div className="border-t border-slate-100 bg-slate-50 px-8 py-4 text-[11px] leading-relaxed text-slate-500 sm:px-10">
        <span className="font-semibold text-slate-700">Methodology:</span> figures derived from
        your verified headcount × industry-standard fully-loaded labor cost (BLS 2023, $
        {formatNumber(cm.fully_loaded_cost_per_role)}/role) × automatable-work share for{" "}
        {cm.industry_label} (McKinsey, 2023). 5-year figure compounded for competitive productivity
        gap.
      </div>
    </div>
  );
}

function Stat({
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
