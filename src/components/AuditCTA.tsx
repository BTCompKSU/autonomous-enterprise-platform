import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditCTAProps {
  className?: string;
  headline?: string;
  subline?: string;
}

export function AuditCTA({
  className,
  headline = "Ready to see your numbers?",
  subline = "Get a personalized AI deployment report tailored to your business — free.",
}: AuditCTAProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-gradient-to-br from-brand/15 via-card to-accent/40 p-8 shadow-sm sm:p-10",
        className,
      )}
    >
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">
            <Sparkles className="h-3 w-3" />
            Free Audit
          </div>
          <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{headline}</h3>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">{subline}</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90 hover:shadow-primary/30"
        >
          Get Your Free Audit Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
