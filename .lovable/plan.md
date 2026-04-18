

## Diagnosis

Server logs confirm the anon-key approach is now reaching the runtime (no "missing env" error) but PostgREST is still rejecting the INSERT with `new row violates row-level security policy`. The RLS policy itself is correct (I verified the regex matches `test@example.com` and the `anon` role is in `polroles`).

The most likely cause: the `SUPABASE_PUBLISHABLE_KEY` injected into the Lovable Cloud worker runtime is the new `sb_publishable_...` format (not the legacy JWT in `.env`). When supabase-js sends it as `Authorization: Bearer <token>`, PostgREST can't decode a role from it and falls back to a role that doesn't satisfy our policy. The legacy JWT works locally but not in production.

## Two paths forward — please pick one

### Option A (recommended): Use the service role key for this server-side write

`SUPABASE_SERVICE_ROLE_KEY` is already auto-provisioned by Lovable Cloud (it's in the secrets list — the user doesn't need to add anything). Lovable Cloud and the service role key aren't opposed — the service role IS the Lovable-Cloud-provided way for trusted server code to write to the DB. RLS still protects the client; only this one server function bypasses it.

- Switch `audit.functions.ts` back to `import { supabaseAdmin } from "@/integrations/supabase/client.server"`
- Remove the local `getServerSupabase()` helper
- Drop the now-unused "Server can finalize pending leads" UPDATE policy (admin client doesn't need it; keeps surface area minimal)
- Keep the INSERT policy in case any client-side anon insert is ever needed

### Option B: Keep anon-only, route writes through a SECURITY DEFINER RPC

Create two Postgres functions owned by `postgres` (bypass RLS by definition):
- `create_pending_lead(website text, email text) returns uuid` — validates inputs, inserts, returns id
- `finalize_lead(lead_id uuid, status text, audit jsonb, enrichment jsonb, error text)` — updates the row

Grant `EXECUTE` to `anon, authenticated`. Server function calls `sb.rpc(...)` instead of `.from('leads').insert(...)`. RLS on the table can then be locked to `false` for INSERT/UPDATE, since all writes go through the validated RPCs.

This avoids any dependency on the service role key and keeps every write path explicit and validated at the DB layer, but requires two new SQL functions and a migration.

Both options fix the bug. Option A is one file edit + one tiny migration. Option B is more code but stricter.

