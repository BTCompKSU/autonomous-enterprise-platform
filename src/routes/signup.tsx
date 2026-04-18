import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapAdminOrg } from "@/lib/org.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  beforeLoad: ({ context }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: context.auth.role === "employee" ? "/employee" : "/dashboard" });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  const [orgName, setOrgName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (signErr) throw signErr;

      // If auto-confirm is on, sign in immediately
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) throw signInErr;

      await bootstrapAdminOrg({ data: { org_name: orgName, full_name: fullName } });
      toast.success("Organization created — welcome!");
      window.location.href = "/dashboard";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Signup failed";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Create your organization</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        You'll be the admin. Invite employees with a shareable code after.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Organization name</label>
          <input
            required
            maxLength={120}
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Your name</label>
          <input
            required
            maxLength={120}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Work email</label>
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
          <p className="mt-1 text-xs text-muted-foreground">Min 8 characters.</p>
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Creating…" : "Create organization"}
        </button>
      </form>
      <div className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand">
          Sign in
        </Link>
      </div>
    </main>
  );
}
