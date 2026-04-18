import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  beforeLoad: ({ context, search }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({ to: search.redirect ?? (context.auth.role === "employee" ? "/employee" : "/dashboard") });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    // Hard navigation to ensure auth state propagates everywhere
    window.location.href = search.redirect ?? "/dashboard";
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Welcome back to UpSkill USA.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <div className="mt-6 space-y-2 text-sm text-muted-foreground">
        <div>
          New admin?{" "}
          <Link to="/signup" className="font-semibold text-brand">
            Create your organization
          </Link>
        </div>
        <div>
          Have an invite code?{" "}
          <Link to="/join" className="font-semibold text-brand">
            Join your team
          </Link>
        </div>
      </div>
    </main>
  );
}
