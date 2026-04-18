

## Diagnosis

Server logs show: `Failed to create lead: new row violates row-level security policy for table "leads"`.

The INSERT is being rejected by RLS. Since `client.server.ts` would `throw` if `SUPABASE_SERVICE_ROLE_KEY` were missing (and we don't see that throw), the service role client is being created — but its key isn't actually bypassing RLS. Either way, debugging which env var is mis-mapped in the Cloud runtime is fragile.

**Better approach**: this is a public lead-capture flow (homepage form, anonymous visitors). It doesn't *need* the admin client. The existing RLS policies are already designed for anon access:

- `Anyone can submit a valid lead` — INSERT for anon/authenticated, with email format check
- `Server can finalize pending leads` — UPDATE for anon/authenticated, only for `status='pending' AND audit IS NULL` → can move to `completed` or `failed`
- `No direct read access to leads` — SELECT blocked (good)

So we just use the regular Lovable Cloud anon client on the server. No service role required.

## Plan (single-file change)

Edit `src/lib/audit.functions.ts`:

1. **Remove** `import { supabaseAdmin } from "@/integrations/supabase/client.server"`.
2. **Add** a small server-side helper that creates a Supabase client using `process.env.SUPABASE_URL` + `process.env.SUPABASE_PUBLISHABLE_KEY` (Lovable Cloud injects these automatically into the server runtime). Falls back to `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` for local dev parity. Cached in module scope.
3. **Replace** all three `supabaseAdmin.from("leads")…` calls (1 INSERT, 2 UPDATEs in the success and failure paths) with the new anon client. RLS allows them all.
4. **Sanitize email before insert**: `const email = data.email.trim().toLowerCase()` so the regex policy never sees stray whitespace/casing edge cases.

No DB migrations needed — current policies are correct for this flow.

## Why this is the right fix for Lovable Cloud

- Uses the standard anon key path that Lovable Cloud reliably provisions.
- Doesn't depend on the service role key being present in the server runtime (which is the actual cause of the failure).
- Keeps RLS doing its job: leads can only be inserted with valid emails, and only `pending` rows with no audit yet can be finalized — even if someone got hold of the anon key, they can't read leads or tamper with completed ones.

