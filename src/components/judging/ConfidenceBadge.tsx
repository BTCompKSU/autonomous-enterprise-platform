import { CheckCircle2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function ConfidenceBadge({
  score,
  threshold = 90,
  reviewer = "Maria",
  compact = false,
}: {
  score: number;
  threshold?: number;
  reviewer?: string;
  compact?: boolean;
}) {
  const auto = score >= threshold;
  const tone = auto
    ? "bg-success/10 text-success border-success/30"
    : "bg-warning/10 text-warning-foreground border-warning/40";
  const Icon = auto ? CheckCircle2 : UserRound;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {score}%
      {!compact && (
        <span className="text-[11px] font-normal opacity-80">
          → {auto ? "Auto-approved" : `Routed to ${reviewer}`}
        </span>
      )}
    </span>
  );
}
