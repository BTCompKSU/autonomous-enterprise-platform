import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "@tanstack/react-router";

export type AppRole = "admin" | "employee";

export interface AuthState {
  loading: boolean;
  session: Session | null;
  user: User | null;
  role: AppRole | null;
  orgId: string | null;
  orgName: string | null;
  fullName: string | null;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultState: AuthState = {
  loading: true,
  session: null,
  user: null,
  role: null,
  orgId: null,
  orgName: null,
  fullName: null,
  isAuthenticated: false,
  refresh: async () => {},
  signOut: async () => {},
};

const AuthCtx = createContext<AuthState>(defaultState);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    role: AppRole | null;
    orgId: string | null;
    orgName: string | null;
    fullName: string | null;
  }>({ role: null, orgId: null, orgName: null, fullName: null });
  const fetchSeq = useRef(0);

  const loadProfile = async (uid: string | null) => {
    const seq = ++fetchSeq.current;
    if (!uid) {
      setProfile({ role: null, orgId: null, orgName: null, fullName: null });
      return;
    }
    const [{ data: prof }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("org_id, full_name").eq("id", uid).maybeSingle(),
      supabase.from("user_roles").select("role, org_id").eq("user_id", uid),
    ]);
    if (seq !== fetchSeq.current) return;
    const role = (roles?.[0]?.role as AppRole | undefined) ?? null;
    const orgId = (prof?.org_id as string | null) ?? null;
    let orgName: string | null = null;
    if (orgId) {
      const { data: org } = await supabase.from("organizations").select("name").eq("id", orgId).maybeSingle();
      if (seq !== fetchSeq.current) return;
      orgName = (org?.name as string | undefined) ?? null;
    }
    setProfile({ role, orgId, orgName, fullName: (prof?.full_name as string | null) ?? null });
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      setSession((prev) => {
        const prevUid = prev?.user.id ?? null;
        const nextUid = s?.user.id ?? null;
        // Only invalidate the router when the actual identity changes
        // (sign-in / sign-out / user switch). Skip TOKEN_REFRESHED and other
        // background events — they would otherwise remount the current route
        // and wipe in-progress local state (e.g. the freshly-generated audit
        // on the home page).
        const identityChanged = prevUid !== nextUid;
        // Defer profile fetch to avoid deadlock with auth state callback
        setTimeout(() => {
          void loadProfile(nextUid).finally(() => setLoading(false));
          if (identityChanged || event === "SIGNED_IN" || event === "SIGNED_OUT") {
            void router.invalidate();
          }
        }, 0);
        return s;
      });
    });

    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void loadProfile(data.session?.user.id ?? null).finally(() => setLoading(false));
    });

    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user: session?.user ?? null,
      role: profile.role,
      orgId: profile.orgId,
      orgName: profile.orgName,
      fullName: profile.fullName,
      isAuthenticated: !!session,
      refresh: () => loadProfile(session?.user.id ?? null),
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [loading, session, profile],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
