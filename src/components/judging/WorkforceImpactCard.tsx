import { Users, ArrowUpRight, Clock, ShieldCheck, Heart } from "lucide-react";

export function WorkforceImpactCard() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5 text-brand" />
        <h3 className="text-lg font-semibold">Workforce Impact Summary</h3>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
          <ShieldCheck className="h-3 w-3" />
          Bias & fairness check: Passed
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric icon={Users} value="0" label="Jobs displaced" tone="text-success" />
        <Metric icon={ArrowUpRight} value="+34" label="Roles transformed" tone="text-brand" />
        <Metric icon={ArrowUpRight} value="+12" label="Promotions enabled" tone="text-brand" />
        <Metric icon={Clock} value="8,400/mo" label="Hours redirected" tone="text-foreground" />
      </div>

      <p className="mt-5 rounded-xl bg-accent/40 p-3 text-sm text-foreground">
        All automation recommendations prioritize{" "}
        <span className="font-semibold">worker augmentation over replacement</span>.
      </p>
    </div>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border bg-background/60 p-3">
      <Icon className={`h-4 w-4 ${tone}`} />
      <div className="mt-2 text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
