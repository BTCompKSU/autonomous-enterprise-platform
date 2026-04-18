import { supabase } from "@/integrations/supabase/client";

/**
 * Builds an `{ Authorization: Bearer <token> }` header from the current
 * Supabase session. Pass the result to any `createServerFn` call that uses
 * `requireSupabaseAuth` middleware:
 *
 *   await myServerFn({ data, headers: await authHeaders() });
 */
export async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}
