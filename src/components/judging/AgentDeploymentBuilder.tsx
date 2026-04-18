import { Zap, Brain, ShieldCheck, UserRound, Cog, ArrowRight } from "lucide-react";

const blocks = [
  { icon: Zap, label: "Trigger", sub: "New invoice received", tone: "bg-warning/15 text-warning-foreground" },
  { icon: Brain, label: "AI Emulator", sub: "Extract + classify", tone: "bg-brand/15 text-brand" },
  { icon: ShieldCheck, label: "Confidence Check", sub: "≥ 90% threshold", tone: "bg-accent text-accent-foreground" },
  { icon: UserRound, label: "Human Review", sub: "If flagged → Maria", tone: "bg-secondary text-secondary-foreground" },
  { icon: Cog, label: "System Action", sub: "Post to ledger", tone: "bg-success/15 text-success" },
];

export function AgentDeploymentBuilder() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">AI Emulator Deployment Builder</h3>
          <p className="text-sm text-muted-foreground">
            Drag-free composition of a deployable emulator unit.
          </p>
        </div>
        <span className="rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-medium text-brand">
          Production-Ready Emulator Flow (Simulated)
        </span>
      </div>

      <div className="mt-6 flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
        {blocks.map((b, i) => (
          <div key={b.label} className="flex flex-1 items-center gap-3">
            <div className={`flex-1 rounded-xl border p-4 ${b.tone}`}>
              <b.icon className="h-4 w-4" />
              <div className="mt-2 text-sm font-semibold">{b.label}</div>
              <div className="text-[11px] opacity-80">{b.sub}</div>
            </div>
            {i < blocks.length - 1 && (
              <ArrowRight className="hidden h-4 w-4 shrink-0 text-muted-foreground lg:block" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
