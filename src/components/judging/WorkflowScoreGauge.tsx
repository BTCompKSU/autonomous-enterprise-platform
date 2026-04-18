import { cn } from "@/lib/utils";

export function WorkflowScoreGauge({
  value,
  label,
  size = 160,
  threshold = 60,
}: {
  value: number;
  label?: string;
  size?: number;
  threshold?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const above = value >= threshold;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--color-muted)"
            strokeWidth={stroke}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="var(--brand)"
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 800ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold tracking-tight text-foreground">{value}%</div>
          <div
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              above ? "text-brand" : "text-muted-foreground",
            )}
          >
            {above ? "Autonomous" : "Assisted"}
          </div>
        </div>
      </div>
      {label && <div className="text-sm font-medium text-foreground">{label}</div>}
    </div>
  );
}
