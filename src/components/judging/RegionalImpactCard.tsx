import { MapPin, GraduationCap, DollarSign } from "lucide-react";

export function RegionalImpactCard() {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary to-primary/85 p-6 text-primary-foreground shadow-lg">
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-brand-glow" />
        <h3 className="text-lg font-semibold">Regional Impact Projection — Miami</h3>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Cell icon={MapPin} value="12,000" label="Workforce impacted" />
        <Cell icon={GraduationCap} value="2,400" label="New AI-skilled roles" />
        <Cell icon={DollarSign} value="$180M / yr" label="Estimated economic uplift" />
      </div>
      <p className="mt-5 text-xs text-primary-foreground/70">
        Model can be adapted for national workforce strategies.
      </p>
    </div>
  );
}

function Cell({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
      <Icon className="h-4 w-4 text-brand-glow" />
      <div className="mt-2 text-2xl font-bold">{value}</div>
      <div className="text-xs text-primary-foreground/70">{label}</div>
    </div>
  );
}
