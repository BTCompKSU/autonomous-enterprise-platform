import { createFileRoute, Link } from "@tanstack/react-router";
import { WhyNowStrip } from "@/components/judging/WhyNowStrip";
import { AuditSplash } from "@/components/AuditSplash";
import { ArrowRight, BarChart3, UserCircle2, Bot, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const PREVIEWS = [
  {
    to: "/preview/executive-audit" as const,
    icon: BarChart3,
    eyebrow: "For executives",
    title: "Executive Audit",
    body: "Workforce score, top opportunities, and 157x ROI — at a glance.",
    cta: "See a sample audit",
  },
  {
    to: "/preview/employee-analysis" as const,
    icon: UserCircle2,
    eyebrow: "For employees",
    title: "Employee Analysis",
    body: "17.8 hours/week recovered. Personalized upskilling pathway.",
    cta: "Meet Maria",
  },
  {
    to: "/preview/agent-builder" as const,
    icon: Bot,
    eyebrow: "For ops & IT",
    title: "Agent Builder",
    body: "Confidence thresholds, scope, and human override — built in.",
    cta: "Tour the builder",
  },
];

function Index() {
  return (
    <main className="bg-background">
      <AuditSplash />

      <WhyNowStrip />

      {/* Previews — art of the possible */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            See it in action
          </div>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Three views. One free audit unlocks all of them.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Tour the executive, employee, and agent experiences — built from
            real audit data. Then run your own in 30 seconds.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {PREVIEWS.map((p) => (
            <Link
              key={p.to}
              to={p.to}
              className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklab, var(--color-brand) 12%, transparent), transparent 70%)",
                }}
              />
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-primary text-brand-foreground">
                  <p.icon className="h-5 w-5" />
                </div>
                <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
                  {p.eyebrow}
                </div>
                <h3 className="mt-1 text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.body}</p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  {p.cta}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Strong primary CTA under the previews */}
        <div className="mt-10 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-card to-primary/10 p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Like what you see? Get yours free.
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            30 seconds. No credit card. A complete audit with executive,
            employee, and agent views — built on your company's real data.
          </p>
          <div className="mt-5">
            <Link
              to="/opportunity"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              Get my free audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
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
              <p className="mt-2 text-sm text-muted-foreground">{p_pillar_text(t)}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/faq"
            className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Have questions? See the FAQ →
          </Link>
        </div>
      </section>
    </main>
  );
}

function p_pillar_text(_t: string) {
  return "";
}
