import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Plus, Activity } from "lucide-react";
import { toast } from "sonner";
import {
  createInviteCode,
  listInviteCodes,
  listOrgEmployees,
  listOrgActivity,
  setEmployeeBuilderAccess,
} from "@/lib/org.functions";
import { authHeaders } from "@/lib/server-fn-auth";

export const Route = createFileRoute("/_authed/_admin/admin/employees")({
  component: AdminEmployeesPage,
});

type Employee = {
  user_id: string;
  role: "admin" | "employee";
  full_name: string;
  can_use_builder: boolean;
  joined_at: string;
};

type InviteCode = {
  code: string;
  expires_at: string;
  max_uses: number;
  used_count: number;
  created_at: string;
};

type ActivityRow = {
  id: string;
  actor_name: string;
  action: string;
  created_at: string;
};

function AdminEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const refresh = async () => {
    try {
      const headers = await authHeaders();
      const [{ employees }, { codes }, { activity }] = await Promise.all([
        listOrgEmployees({ data: undefined, headers }),
        listInviteCodes({ data: undefined, headers }),
        listOrgActivity({ data: { limit: 30 }, headers }),
      ]);
      setEmployees(employees);
      setCodes(codes);
      setActivity(activity);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const generateCode = async () => {
    setGenerating(true);
    try {
      const { code } = await createInviteCode({
        data: { expires_in_hours: 168, max_uses: 5 },
        headers: await authHeaders(),
      });
      await navigator.clipboard.writeText(code).catch(() => {});
      toast.success(`Invite code ${code} copied to clipboard`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create invite");
    } finally {
      setGenerating(false);
    }
  };

  const toggleBuilder = async (e: Employee) => {
    try {
      await setEmployeeBuilderAccess({
        data: { employee_id: e.user_id, can_use_builder: !e.can_use_builder },
        headers: await authHeaders(),
      });
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update");
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
            Admin · Team
          </span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Employees & invites</h1>
          <p className="text-muted-foreground">
            Generate invite codes, manage roster, and monitor activity.
          </p>
        </div>
        <button
          onClick={generateCode}
          disabled={generating}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          <Plus className="h-4 w-4" />
          {generating ? "Generating…" : "Generate invite code"}
        </button>
      </header>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Active invite codes</h2>
        {loading ? (
          <p className="mt-2 text-sm text-muted-foreground">Loading…</p>
        ) : codes.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No invites yet. Generate one above.</p>
        ) : (
          <div className="mt-4 divide-y">
            {codes.map((c) => {
              const expired = new Date(c.expires_at) < new Date();
              const exhausted = c.used_count >= c.max_uses;
              return (
                <div key={c.code} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <div className="font-mono text-sm font-semibold tracking-wider">{c.code}</div>
                    <div className="text-xs text-muted-foreground">
                      {c.used_count}/{c.max_uses} used · expires {new Date(c.expires_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(expired || exhausted) && (
                      <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                        {expired ? "expired" : "fully used"}
                      </span>
                    )}
                    <button
                      onClick={() => {
                        void navigator.clipboard.writeText(c.code);
                        toast.success("Copied");
                      }}
                      className="rounded-full border p-1.5 hover:bg-accent"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Roster ({employees.length})</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-2">Name</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Builder access</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {employees.map((e) => (
                <tr key={e.user_id}>
                  <td className="py-3 font-medium">{e.full_name}</td>
                  <td>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${e.role === "admin" ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"}`}
                    >
                      {e.role}
                    </span>
                  </td>
                  <td className="text-xs text-muted-foreground">
                    {new Date(e.joined_at).toLocaleDateString()}
                  </td>
                  <td>
                    {e.role === "admin" ? (
                      <span className="text-xs text-muted-foreground">always</span>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={e.can_use_builder}
                          onChange={() => void toggleBuilder(e)}
                        />
                        <span className="text-xs">{e.can_use_builder ? "enabled" : "blocked"}</span>
                      </label>
                    )}
                  </td>
                </tr>
              ))}
              {employees.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-sm text-muted-foreground">
                    No employees yet. Share an invite code to add your team.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Activity className="h-4 w-4 text-brand" />
          Activity
        </h2>
        {activity.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No activity yet.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {activity.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2.5 text-sm">
                <span>
                  <span className="font-medium">{a.actor_name}</span>{" "}
                  <span className="text-muted-foreground">— {a.action}</span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
