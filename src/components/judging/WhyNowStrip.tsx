import { AlertCircle, EyeOff, Unplug, ArrowRight } from "lucide-react";

const items = [
  {
    icon: AlertCircle,
    title: "Emulators stuck in proof-of-concept",
    body: "82% of enterprise AI pilots never reach production. Reliability gaps kill momentum.",
  },
  {
    icon: EyeOff,
    title: "No visibility into task-level impact",
    body: "Leaders can't measure ROI when automation lives inside opaque emulator loops.",
  },
  {
    icon: Unplug,
    title: "No bridge between automation and workforce",
    body: "Workers fear replacement. There's no path from displacement to opportunity.",
  },
];

export function WhyNowStrip() {
  return (
    <section className="border-y bg-muted/40 py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Why now
            </div>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Why AI automation is failing today
            </h2>
          </div>
          <p className="text-sm text-muted-foreground sm:max-w-xs sm:text-right">
            UpSkill USA fixes all three.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border bg-card p-6 shadow-sm">
              <it.icon className="h-5 w-5 text-destructive" />
              <h3 className="mt-3 text-base font-semibold">{it.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{it.body}</p>
              <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand">
                We solve this <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
