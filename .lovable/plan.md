
The user is right — Lovable Cloud is enabled, and the runtime secrets list confirms `SUPABASE_SERVICE_ROLE_KEY` is already provisioned automatically. There's no need to ask the user to add it.

Looking at `src/lib/audit.functions.ts`, the current `getServerSupabase()` helper already falls back to the publishable key, but the cleaner fix is to use the project's existing `supabaseAdmin` client from `src/integrations/supabase/client.server.ts`, which is the canonical pattern for Lovable Cloud server functions.

Also, the temporary RLS "Anyone can update leads" policy I added (and then dropped) is no longer needed — the admin client bypasses RLS.

## Plan

1. **Refactor `src/lib/audit.functions.ts`**:
   - Remove the local `getServerSupabase()` helper.
   - Import `supabaseAdmin` from `@/integrations/supabase/client.server`.
   - Replace `supabaseAdmin = getServerSupabase()` in the handler with the imported singleton.

2. **No DB changes needed** — the second migration already cleaned up the temporary update policy. The existing INSERT policy stays for any future client-side use; the server function uses the admin client which bypasses RLS regardless.

3. **No secret request needed** — `SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_URL` are already injected by Lovable Cloud.

That's it — single-file edit.
