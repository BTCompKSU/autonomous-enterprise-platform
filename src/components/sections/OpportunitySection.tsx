import { Building2 } from "lucide-react";
import { WorkflowScoreGauge } from "@/components/judging/WorkflowScoreGauge";
import { DemoTip } from "@/components/judging/DemoMode";
import { BottomCTA, SectionHeader } from "@/components/preview-shared";

const departments = [
  { name: "Finance", score: 68, opps: 14, unlocked: "$2.4M", capacity: "1,800 hrs/mo" },
  { name: "Customer Service", score: 62, opps: 22, unlocked: "$1.9M", capacity: "2,400 hrs/mo" },
  { name: "Operations", score: 54, opps: 18, unlocked: "$1.2M", capacity: "1,600 hrs/mo" },
  { name: "HR", score: 48, opps: 9, unlocked: "$640K", capacity: "720 hrs/mo" },
  { name: "Legal", score: 41, opps: 7, unlocked: "$520K", capacity: "560 hrs/mo" },
  { name: "Marketing", score: 58, opps: 12, unlocked: "$880K", capacity: "1,100 hrs/mo" },
];

export function OpportunitySection() {
  return (
    <section id="opportunity" className="scroll-mt-32 border-t bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Opportunity Map"
          title="Where can AI deliver reliable value, today?"
          subtitle="Every department scored on its Autonomous Workflow Score — the % of work that can run end-to-end with minimal human intervention."
        />

        <DemoTip label="Per-department Autonomous Workflow Score" className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <div
                key={d.name}
                className="group flex flex-col rounded-2xl border bg-card p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold">{d.name}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <WorkflowScoreGauge value={d.score} size={120} />
                  <div className="space-y-2 text-right text-sm">
                    <Row label="Opportunities" value={`${d.opps}`} />
                    <Row label="Productivity unlocked" value={d.unlocked} />
                    <Row label="Capacity gained" value={d.capacity} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </DemoTip>

        <div className="mt-10 rounded-2xl border bg-accent/40 p-6">
          <p className="text-sm">
            <span className="font-semibold">
              Companies above 60% operate as Autonomous Enterprises.
            </span>{" "}
            You're 2 departments away.
          </p>
        </div>

        <BottomCTA
          line="See your own opportunity landscape"
          sub="Get a department-by-department breakdown of where AI can deliver value in your business — free."
        />
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
