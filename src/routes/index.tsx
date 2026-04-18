import { createFileRoute } from "@tanstack/react-router";
import { WhyNowStrip } from "@/components/judging/WhyNowStrip";
import { ArchitectureFooter } from "@/components/judging/ArchitectureFooter";
import { AuditSplash } from "@/components/AuditSplash";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="bg-background">
      <AuditSplash />

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
