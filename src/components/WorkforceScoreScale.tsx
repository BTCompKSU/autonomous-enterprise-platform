// Visual benchmark scale for the Autonomous Workforce Score.
// Helps readers interpret whether a 0-100 score is good, average, or behind.
//
// Bands (industry-calibrated):
//   0–39   Lagging       — manual-first, AI not yet structurally adopted
//   40–59  Emerging      — pockets of automation, no enterprise leverage
//   60–74  Competitive   — AI integrated into core workflows
//   75–100 Leader        — autonomous workflows at scale

export function WorkforceScoreScale({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const band =
    clamped < 40
      ? { label: "Lagging", tone: "text-rose-700", desc: "Behind the market" }
      : clamped < 60
        ? { label: "Emerging", tone: "text-amber-700", desc: "Below average" }
        : clamped < 75
          ? { label: "Competitive", tone: "text-emerald-700", desc: "At or above market" }
          : { label: "Leader", tone: "text-emerald-700", desc: "Top-quartile performance" };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <span>How to read this score</span>
        <span className={band.tone}>
          {band.label} · {band.desc}
        </span>
      </div>

      {/* Gradient bar */}
      <div className="relative mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #fecaca 0%, #fcd34d 40%, #86efac 60%, #16a34a 100%)",
          }}
        />
        {/* Band dividers */}
        <div className="pointer-events-none absolute inset-y-0 left-[40%] w-px bg-white/70" />
        <div className="pointer-events-none absolute inset-y-0 left-[60%] w-px bg-white/70" />
        <div className="pointer-events-none absolute inset-y-0 left-[75%] w-px bg-white/70" />
        {/* Marker */}
        <div
          className="absolute -top-1 h-4.5 w-1 -translate-x-1/2 rounded-full bg-[#0B1F3B] shadow"
          style={{ left: `${clamped}%`, height: "1.125rem" }}
          aria-label={`Your score: ${clamped}`}
        />
      </div>

      {/* Band labels */}
      <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] font-medium text-slate-500">
        <ScaleLabel range="0–39" name="Lagging" />
        <ScaleLabel range="40–59" name="Emerging" />
        <ScaleLabel range="60–74" name="Competitive" />
        <ScaleLabel range="75–100" name="Leader" />
      </div>
    </div>
  );
}

function ScaleLabel({ range, name }: { range: string; name: string }) {
  return (
    <div className="text-center">
      <div className="font-semibold text-slate-700">{name}</div>
      <div className="text-slate-400">{range}</div>
    </div>
  );
}
