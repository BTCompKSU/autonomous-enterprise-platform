import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Pause, Play, Shield } from "lucide-react";
import { toast } from "sonner";
import { listAgentGovernance, setAgentGovernance } from "@/lib/org.functions";

export const Route = createFileRoute("/_authed/_admin/admin/governance")({
  component: GovernancePage,
});

const SKILLS = [
  { id: "ap-invoice-classification", name: "AP · Invoice classification", default_min: 90 },
  { id: "ap-po-matching", name: "AP · PO matching (3-way)", default_min: 92 },
  { id: "ap-vendor-risk", name: "AP · Vendor risk scoring", default_min: 80 },
  { id: "ap-approval-routing", name: "AP · Approval routing", default_min: 95 },
  { id: "ap-exception-handling", name: "AP · Exception handling", default_min: 75 },
];

type GovRow = { skill_id: string; min_confidence: number; is_paused: boolean };

function GovernancePage() {
  const [rows, setRows] = useState<Record<string, GovRow>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { governance } = await listAgentGovernance({ data: undefined });
      const map: Record<string, GovRow> = {};
      for (const g of governance) {
        map[g.skill_id] = {
          skill_id: g.skill_id,
          min_confidence: g.min_confidence,
          is_paused: g.is_paused,
        };
      }
      setRows(map);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = async (skill_id: string, patch: Partial<GovRow>) => {
    const current =
      rows[skill_id] ?? {
        skill_id,
        min_confidence: SKILLS.find((s) => s.id === skill_id)?.default_min ?? 90,
        is_paused: false,
      };
    const next = { ...current, ...patch };
    setRows((r) => ({ ...r, [skill_id]: next }));
    try {
      await setAgentGovernance({
        data: {
          skill_id,
          min_confidence: next.min_confidence,
          is_paused: next.is_paused,
        },
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
      await load();
    }
  };

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-6 py-12">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Admin · Governance
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Agent governance</h1>
        <p className="text-muted-foreground">
          Pause individual agents and set the minimum confidence threshold for autonomous action.
        </p>
      </header>

      <div className="rounded-2xl border bg-card shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <ul className="divide-y">
            {SKILLS.map((s) => {
              const row =
                rows[s.id] ?? { skill_id: s.id, min_confidence: s.default_min, is_paused: false };
              return (
                <li key={s.id} className="grid gap-4 p-6 md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <div className="flex items-center gap-2 font-semibold">
                      <Shield className="h-4 w-4 text-brand" />
                      {s.name}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Min confidence:{" "}
                      <span className="font-mono">{row.min_confidence}%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 md:w-72">
                    <input
                      type="range"
                      min={50}
                      max={100}
                      step={1}
                      value={row.min_confidence}
                      onChange={(e) =>
                        update(s.id, { min_confidence: parseInt(e.target.value, 10) })
                      }
                      className="w-full"
                    />
                    <span className="w-10 text-right font-mono text-sm">{row.min_confidence}</span>
                  </div>

                  <button
                    onClick={() => update(s.id, { is_paused: !row.is_paused })}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
                      row.is_paused
                        ? "bg-destructive/15 text-destructive hover:bg-destructive/25"
                        : "bg-success/15 text-success hover:bg-success/25"
                    }`}
                  >
                    {row.is_paused ? (
                      <>
                        <Pause className="h-3.5 w-3.5" /> Paused
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" /> Active
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
