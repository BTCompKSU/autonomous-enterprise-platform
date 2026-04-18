

## Diagnosis

The `leads` table has **zero rows** — every audit submission has failed before any row was written. RLS is correctly configured (anon INSERT is allowed for valid emails, no SELECT for anyone). The current server function uses `supabaseAdmin` (service role), which *should* bypass RLS, but the table being empty means the service-role write is never landing — almost certainly because `SUPABASE_SERVICE_ROLE_KEY` is not actually being injected into the Worker runtime, so `client.server.ts` throws on first use.

We've now bounced between three configurations (anon-key, service-role-key, RLS-policy-tweaks) and each one fails for a different runtime reason. This is the loop you're describing.

## The fix: stop depending on key-format / runtime env injection

Route every `leads` write through two `SECURITY DEFINER` Postgres functions. They execute as `postgres` (bypass RLS structurally, no key gymnastics), and they're called via `supabase.rpc(...)` from the anon client — which we've proven reaches the runtime (signup/login/invite all work today through anon).

### Migration

Two new functions:
- `create_pending_lead(_website text, _email text) returns uuid` — validates inputs, inserts a `pending` row, returns `id`.
- `finalize_lead(_lead_id uuid, _status text, _audit jsonb, _enrichment jsonb, _error text)` — updates the row.

Both `SECURITY DEFINER`, `SET search_path = public`, owned by `postgres`. `GRANT EXECUTE ... TO anon, authenticated`.

Optionally tighten the `leads` RLS to deny direct INSERT/UPDATE entirely — all writes will go through these RPCs, so the table becomes write-only via vetted code paths.

### Code changes

- `src/lib/audit.functions.ts`:
  - Drop the `supabaseAdmin` import.
  - Use the regular `supabase` (anon) client.
  - Replace the `.from("leads").insert(...)` with `supabase.rpc("create_pending_lead", {...})`.
  - Replace the `.from("leads").update(...)` (success and failure paths) with `supabase.rpc("finalize_lead", {...})`.

That's a single file edit + one migration. No env-var dependency, no key-format dependency, no RLS policy tweaking.

## Why this finally breaks the loop

- The anon path is the only path proven to work in this Worker runtime.
- `SECURITY DEFINER` functions are the standard Postgres mechanism for trusted server logic — they don't care which key called them, only that the role has `EXECUTE` permission.
- If a future deployment again ships a key in a different format, this still works — `EXECUTE` is granted to the role, not tied to a specific key encoding.
- Validation (email regex, length) lives at the DB layer, so even though we're calling from anon, garbage can't be inserted.

