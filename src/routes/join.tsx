import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { redeemInviteCode } from "@/lib/org.functions";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/join")({
  component: JoinPage,
});

function JoinPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  // If the user is already in an org, send them to their dashboard.
  useEffect(() => {
    if (auth.loading) return;
    if (auth.isAuthenticated && auth.orgId) {
      navigate({ to: auth.role === "admin" ? "/dashboard" : "/employee" });
    }
  }, [auth.loading, auth.isAuthenticated, auth.orgId, auth.role, navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (!auth.isAuthenticated) {
        if (mode === "signup") {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: `${window.location.origin}/employee`,
            },
          });
          if (error) throw error;
          const { error: siErr } = await supabase.auth.signInWithPassword({ email, password });
          if (siErr) throw siErr;
        } else {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        }
      }
      const { data: sess } = await supabase.auth.getSession();
      const accessToken = sess.session?.access_token;
      if (!accessToken) throw new Error("No session. Please sign in again.");
      await redeemInviteCode({
        data: { code: code.trim().toUpperCase() },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Joined your organization!");
      window.location.href = "/employee";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to join";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Join your team</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter the invite code your admin shared with you.
      </p>

      {!auth.isAuthenticated && (
        <div className="mt-6 inline-flex rounded-full border bg-card p-1 text-xs">
          <button
            onClick={() => setMode("signup")}
            className={`rounded-full px-3 py-1.5 ${mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            New account
          </button>
          <button
            onClick={() => setMode("signin")}
            className={`rounded-full px-3 py-1.5 ${mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
          >
            Existing account
          </button>
        </div>
      )}

      <form onSubmit={submit} className="mt-6 space-y-4">
        {!auth.isAuthenticated && mode === "signup" && (
          <div>
            <label className="text-sm font-medium">Your name</label>
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
            />
          </div>
        )}
        {!auth.isAuthenticated && (
          <>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-sm font-medium">Invite code</label>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="ABCD1234"
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 font-mono text-sm uppercase tracking-wider"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Joining…" : "Join organization"}
        </button>
      </form>

      <div className="mt-6 text-sm text-muted-foreground">
        Are you an admin?{" "}
        <Link to="/signup" className="font-semibold text-brand">
          Create an organization
        </Link>
      </div>
    </main>
  );
}
