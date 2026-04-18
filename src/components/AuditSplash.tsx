import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, CheckCircle2, Loader2, Mail, Sparkles, ShieldCheck, Globe } from "lucide-react";
import { generateAudit } from "@/lib/audit.functions";
import type { AuditReport } from "@/lib/audit-types";
import { toast } from "sonner";

type Step = "website" | "email" | "loading" | "report";

export function AuditSplash() {
  const generateAuditFn = useServerFn(generateAudit);
  const [step, setStep] = useState<Step>("website");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [audit, setAudit] = useState<AuditReport | null>(null);
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
    setEmailSent(false);
    setError(null);
  }

  return (
    <section className="relative isolate overflow-hidden bg-[#0B1F3B] text-white">
      {/* Background — deep navy with soft overlay grid + restrained gold glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 110%, rgba(245,200,76,0.10), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent 80%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl px-6 py-20 sm:py-28 lg:py-32">
        {/* Eyebrow */}
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#F5C84C]/40 bg-[#F5C84C]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#F5C84C]">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise AI Readiness Audit
          </span>
        </div>

        {/* Headline */}
        <h1 className="mx-auto mt-7 max-w-3xl text-center text-4xl font-semibold leading-[1.08] tracking-[-0.015em] text-white sm:text-5xl lg:text-[64px]">
          Identify where AI can{" "}
          <span className="text-[#F5C84C]">
            transform operations
          </span>{" "}
          across your company.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-white/70 sm:text-lg">
          Enter your company URL to generate a real-time audit of AI-ready workflows,
          operational gaps, and automation opportunities across your organization.
        </p>

        {/* Flow */}
        <div className="mx-auto mt-12 max-w-2xl">
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
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand to-primary opacity-30 blur-lg transition group-focus-within:opacity-60" />
              <div className="relative rounded-2xl border bg-card p-6 shadow-2xl sm:p-8">
                <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  Auditing <span className="font-mono font-medium text-foreground">{website}</span>
                  <button
                    type="button"
                    onClick={() => setStep("website")}
                    className="ml-auto text-xs text-muted-foreground underline-offset-2 hover:underline"
                  >
                    change
                  </button>
                </div>
                <label className="text-base font-semibold text-foreground">
                  Where should we send your report?
                </label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your audit appears on this page and a copy is emailed to you.
                </p>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-xl border bg-background px-4">
                    <Mail className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      autoFocus
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="h-14 w-full bg-transparent text-base font-medium text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
                  >
                    Send My Report
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {error && (
                  <div className="mt-3 text-sm text-destructive">{error}</div>
                )}
                <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  We never sell your email. One audit, no spam.
                </div>
              </div>
            </form>
          )}

          {step === "loading" && (
            <div className="rounded-2xl border bg-card p-10 text-center shadow-2xl">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-brand" />
              <h3 className="mt-4 text-xl font-semibold">Analyzing {website}…</h3>
              <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left text-sm text-muted-foreground">
                <LoadingStep label="Scanning your website" delay={0} />
                <LoadingStep label="Enriching with company intelligence" delay={1} />
                <LoadingStep label="Mapping AI deployment opportunities" delay={2} />
                <LoadingStep label="Scoring autonomous workforce readiness" delay={3} />
              </ul>
            </div>
          )}

          {step === "report" && audit && (
            <AuditReportCard
              audit={audit}
              website={website}
              email={email}
              emailSent={emailSent}
              onReset={reset}
            />
          )}
        </div>

        {/* Trust bar */}
        {step !== "report" && (
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <Trust label="30-second audit" />
            <Trust label="No credit card required" />
            <Trust label="Built on enterprise-grade AI" />
          </div>
        )}
      </div>
    </section>
  );
}

function LoadingStep({ label, delay }: { label: string; delay: number }) {
  return (
    <li
      className="flex items-center gap-2 opacity-0 [animation-fill-mode:forwards]"
      style={{
        animation: `fadeIn 400ms ease-out ${delay * 600}ms forwards`,
      }}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-brand/40 bg-brand/10 text-[10px] font-bold text-brand">
        {delay + 1}
      </span>
      {label}
      <style>{`@keyframes fadeIn { to { opacity: 1; transform: translateY(0); } from { opacity: 0; transform: translateY(4px); } }`}</style>
    </li>
  );
}

function Trust({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border bg-card/60 px-4 py-2.5 backdrop-blur">
      <CheckCircle2 className="h-4 w-4 text-brand" />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

function AuditReportCard({
  audit,
  website,
  email,
  emailSent,
  onReset,
}: {
  audit: AuditReport;
  website: string;
  email: string;
  emailSent: boolean;
  onReset: () => void;
}) {
  const score = Math.round(audit.autonomous_workforce_score);
  return (
    <div className="rounded-3xl border bg-card p-8 shadow-2xl sm:p-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            Your AI Readiness Audit
          </div>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">{audit.company_name}</h2>
          <p className="text-sm text-muted-foreground">
            {website} · {audit.industry} · {audit.size_estimate}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Run another
        </button>
      </div>

      {emailSent && (
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Mail className="h-3.5 w-3.5" />A copy was emailed to {email}
        </div>
      )}

      <div className="mt-6 grid gap-6 rounded-2xl border bg-gradient-to-br from-brand/10 via-card to-primary/10 p-6 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Autonomous Workforce Score
          </div>
          <div className="mt-1 text-7xl font-extrabold leading-none text-primary">
            {score}
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
        </div>
        <p className="text-sm text-foreground/80">{audit.score_rationale}</p>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold">Executive Summary</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/80">
          {audit.executive_summary}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-base font-semibold">Top AI Deployment Opportunities</h3>
        <div className="mt-3 grid gap-3">
          {audit.top_opportunities.map((opp) => (
            <div key={opp.title} className="rounded-xl border bg-background p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{opp.title}</div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Tag tone="brand">{opp.department}</Tag>
                  <Tag tone={opp.impact === "High" ? "success" : "muted"}>{opp.impact} impact</Tag>
                  <Tag tone={opp.effort === "Low" ? "success" : "muted"}>{opp.effort} effort</Tag>
                  <Tag tone="primary">~{opp.estimated_hours_saved_per_week} hrs/wk</Tag>
                </div>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{opp.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold">Risks to Watch</h3>
          <ul className="mt-2 space-y-1.5 text-sm text-foreground/80">
            {audit.risks.map((r) => (
              <li key={r} className="flex gap-2">
                <span className="text-warning">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold">Next Steps</h3>
          <ol className="mt-2 space-y-1.5 text-sm text-foreground/80">
            {audit.next_steps.map((r, i) => (
              <li key={r} className="flex gap-2">
                <span className="font-mono text-brand">{i + 1}.</span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Tag({
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
