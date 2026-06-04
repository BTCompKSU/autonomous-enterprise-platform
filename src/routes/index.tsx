import { createFileRoute, Link } from "@tanstack/react-router";
import { WhyNowStrip } from "@/components/judging/WhyNowStrip";
import { AuditSplash } from "@/components/AuditSplash";
import { HomeSectionNav } from "@/components/HomeSectionNav";
import { OpportunitySection } from "@/components/sections/OpportunitySection";
import { ExecutiveAuditSection } from "@/components/sections/ExecutiveAuditSection";
import { EmployeeAnalysisSection } from "@/components/sections/EmployeeAnalysisSection";
import { EmulatorBuilderSection } from "@/components/sections/EmulatorBuilderSection";
import { ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "UpSkill USA — Enterprise AI Readiness Audit" },
      {
        name: "description",
        content:
          "Opportunity map, executive audit, employee analysis, and emulator builder — one scrolling tour of how AI deploys safely inside your business.",
      },
      { property: "og:title", content: "UpSkill USA — Enterprise AI Readiness Audit" },
      {
        property: "og:description",
        content:
          "See where AI delivers value, what executives unlock, how employees transform, and how emulators ship with guardrails.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-background">
      <AuditSplash />
      <WhyNowStrip />

      <HomeSectionNav />

      <OpportunitySection />
      <ExecutiveAuditSection />
      <EmployeeAnalysisSection />
      <EmulatorBuilderSection />

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
            ["What AI should do", "Task-level automation clarity, not vague emulators."],
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

        {/* Final CTA */}
        <div className="mt-10 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 via-card to-primary/10 p-8 text-center shadow-sm">
          <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Like what you see? Get yours free.
          </h3>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            30 seconds. No credit card. A complete audit built on your company's real data.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/opportunity"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              Get my free audit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/onboarding/step-1"
              className="inline-flex items-center gap-2 rounded-full border border-warning bg-warning/10 px-5 py-2.5 text-sm font-semibold text-warning transition hover:bg-warning hover:text-warning-foreground"
            >
              Start your profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
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
