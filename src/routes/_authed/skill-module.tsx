import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfidenceBadge } from "@/components/judging/ConfidenceBadge";
import { AgentDeploymentBuilder } from "@/components/judging/AgentDeploymentBuilder";
import { DemoTip } from "@/components/judging/DemoMode";
import { AuditCTA } from "@/components/AuditCTA";
import { useAuth } from "@/lib/auth-context";
import { getMyEmployeeAccess, logActivity } from "@/lib/org.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/skill-module")({
  component: SkillModule,
});

const tasks = [
  { id: 1, name: "Invoice classification", confidence: 98, owner: "AI Emulator" },
  { id: 2, name: "PO matching (3-way)", confidence: 94, owner: "AI Emulator" },
  { id: 3, name: "Vendor risk scoring", confidence: 72, owner: "Maria (Reviewer)" },
  { id: 4, name: "Approval routing", confidence: 96, owner: "AI Emulator" },
  { id: 5, name: "Exception handling", confidence: 64, owner: "Maria (Reviewer)" },
];

function SkillModule() {
  const auth = useAuth();
  const [canUseBuilder, setCanUseBuilder] = useState<boolean | null>(null);

  useEffect(() => {
    if (auth.role === "admin") {
      setCanUseBuilder(true);
      return;
    }
    void getMyEmployeeAccess({ data: undefined }).then((r) => setCanUseBuilder(r.can_use_builder));
  }, [auth.role]);

  const requestAccess = async () => {
    try {
      await logActivity({ data: { action: "request_builder_access" } });
      toast.success("Request sent to your admin");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send request");
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Emulator Builder
        </span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Finance · Accounts Payable Skill
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          A composable, deployable emulator unit. Every task carries a confidence score; low-confidence
          work is automatically routed to a human.
        </p>
      </header>

      {canUseBuilder === false ? (
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border bg-card p-8 shadow-sm">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-muted">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Builder access required</h2>
            <p className="mt-1 max-w-lg text-sm text-muted-foreground">
              Your admin hasn't granted you Emulator Builder access yet. Request access and they'll be
              notified.
            </p>
          </div>
          <button
            onClick={requestAccess}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Request access
          </button>
        </div>
      ) : (
        <>
          <DemoTip label="Production-ready emulator flow with confidence checks" className="mt-10">
            <AgentDeploymentBuilder />
          </DemoTip>

          <section className="mt-10 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Task-level confidence (last 24h)</h2>
            <p className="text-sm text-muted-foreground">
              Threshold: 90%. Below threshold → routed to a named human reviewer.
            </p>
            <div className="mt-5 divide-y">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-4 py-3">
                  <div className="w-6 text-xs font-mono text-muted-foreground">#{t.id}</div>
                  <div className="flex-1">
                    <div className="font-medium">{t.name}</div>
                    <div className="text-xs text-muted-foreground">Owner: {t.owner}</div>
                  </div>
                  <ConfidenceBadge score={t.confidence} />
                </div>
              ))}
            </div>
          </section>

          <div className="mt-8 flex justify-end">
            <Link
              to="/employee"
              className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              See impact on a worker <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </>
      )}

      <AuditCTA
        className="mt-10"
        headline="Build emulators for your business"
        subline="Get a free audit that maps deployable AI emulators to your real workflows — with confidence scores."
      />
    </main>
  );
}
