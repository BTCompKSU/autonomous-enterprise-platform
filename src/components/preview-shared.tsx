import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight } from "lucide-react";

export function BottomCTA({ line, sub }: { line: string; sub: string }) {
  return (
    <div className="mt-10 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-card p-8 text-center shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">{line}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{sub}</p>
      <div className="mt-5">
        <Link
          to="/opportunity"
          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
        >
          <Sparkles className="h-4 w-4" />
          Get my free audit
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrow}
      </div>
      <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{subtitle}</p>
    </div>
  );
}
