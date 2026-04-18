import { Layers } from "lucide-react";

export function ArchitectureFooter() {
  const rows = [
    ["Frontend", "React + TanStack Start (Lovable)"],
    ["Backend", "Lovable Cloud (Supabase under the hood)"],
    ["AI Layer", "Modular emulator orchestration (conceptual)"],
    ["Data", "Workflow + task-level modeling"],
  ];
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-glow">
          <Layers className="h-4 w-4" />
          System Architecture (Simulated)
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-2.5 text-sm ring-1 ring-white/10"
            >
              <span className="text-primary-foreground/60">{k}</span>
              <span className="font-medium">{v}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-primary-foreground/50">
          © UpSkill USA — From AI Pilots to Reliable Autonomous Operations.
        </p>
      </div>
    </footer>
  );
}
