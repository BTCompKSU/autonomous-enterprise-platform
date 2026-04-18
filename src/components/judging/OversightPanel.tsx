import { Activity, ShieldCheck, AlertTriangle, TrendingUp } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export function OversightPanel() {
  const [threshold, setThreshold] = useState([90]);
  const auto = Math.max(40, Math.min(95, 130 - threshold[0]));
  const human = 100 - auto;

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <h3 className="text-lg font-semibold">AI Confidence & Oversight System</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Every automated task runs through a confidence check. Below threshold → human review.
          </p>
        </div>
        <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          Improving with feedback
        </span>
      </div>

      <div className="mt-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-foreground">Reliability Threshold</span>
          <span className="font-mono text-brand">{threshold[0]}%</span>
        </div>
        <Slider value={threshold} onValueChange={setThreshold} min={70} max={99} step={1} />
        <p className="text-xs text-muted-foreground">
          Tasks below {threshold[0]}% are automatically routed to a human reviewer.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={Activity} label="Auto-approved" value={`${auto}%`} tone="text-success" />
        <Stat icon={ShieldCheck} label="Human-reviewed" value={`${human}%`} tone="text-brand" />
        <Stat icon={AlertTriangle} label="Error rate" value="1.8%" tone="text-warning-foreground" />
        <Stat icon={TrendingUp} label="Weekly Δ" value="+4.2%" tone="text-success" />
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className={`h-3.5 w-3.5 ${tone}`} />
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold text-foreground">{value}</div>
    </div>
  );
}
