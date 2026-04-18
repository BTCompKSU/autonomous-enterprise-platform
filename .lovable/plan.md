

## Plan: Tiered Auth (Admins ↔ Employees) with Org Governance

### Data model (one migration)

```text
organizations
  id, name, owner_admin_id, created_at

profiles            ← 1:1 with auth.users, auto-created via trigger
  id (= auth.users.id), org_id, full_name, created_at

user_roles          ← separate table; never store role on profile
  user_id, role ('admin'|'employee'), org_id    UNIQUE(user_id, role)

invite_codes        ← admin-issued, code-based join
  code (text PK, 8-char), org_id, created_by, expires_at, max_uses, used_count

agent_governance    ← admin controls per skill / per employee
  org_id, skill_id (text), min_confidence (int), is_paused (bool)

employee_agent_access
  org_id, employee_id, can_use_builder (bool), updated_by, updated_at

activity_log        ← visible to admins of same org
  id, org_id, actor_id, action, meta jsonb, created_at
```

**Security definer helpers** (avoid RLS recursion):
- `has_role(_uid, _role)` 
- `org_of(_uid)` returns the user's org_id
- `is_admin_of(_uid, _org)` 

**RLS summary**:
- `profiles`: read own + read members of same org; update own only
- `organizations`: read if member; update if admin of that org
- `user_roles`: read own + read for same org if admin; write admin-only
- `invite_codes`: insert/select/update only by admins of that org; **public RPC** `redeem_invite_code(code)` (SECURITY DEFINER) joins the caller as employee
- `agent_governance`, `employee_agent_access`: read all org members; write admin-only
- `activity_log`: insert authenticated; select admin-only of same org

**Trigger**: `handle_new_user()` on `auth.users` insert → creates `profiles` row. Org + admin role are assigned by signup server fn (not the trigger) so we can decide admin-vs-employee path.

---

### Auth wiring

1. **Router context** — extend `getRouter` to inject `auth` (session, user, role, orgId, helpers). Subscribe to `supabase.auth.onAuthStateChange` and call `router.invalidate()` so `beforeLoad` re-evaluates.
2. **`__root.tsx`** — switch to `createRootRouteWithContext<{ auth: AuthState }>`.
3. **Pathless layouts** for guards:
   - `src/routes/_authed.tsx` — redirects to `/login` if no session
   - `src/routes/_authed/_admin.tsx` — requires `role='admin'`
   - `src/routes/_authed/_employee.tsx` — requires `role='employee'` OR admin (admins can view)

### Routes (new + moved)

```
/login                      public
/signup                     public — creates org + admin
/join                       public — enter invite code (after login or inline signup)
/_authed/dashboard          (move dashboard.tsx here; admin layout)
/_authed/admin/employees    invites + roster + activity feed + access toggles
/_authed/admin/governance   pause/kill agents, set confidence thresholds
/_authed/employee           (move employee.tsx; visible to employee + admin)
/_authed/skill-module       (move; gated by employee_agent_access.can_use_builder)
```

Public, unchanged: `/`, `/opportunity`, `/demo`.

### Server functions (`src/lib/auth.functions.ts`, `src/lib/org.functions.ts`)

- `signupAdmin({email, password, full_name, org_name})` — Supabase signup → on confirm/login, RPC `bootstrap_admin_org(org_name)` creates org + assigns admin role + profile.org_id.
- `redeemInviteCode({code})` — RPC; assigns caller `employee` role + profile.org_id.
- `createInvite({expires_in_hours, max_uses})` — admin only; returns 8-char code.
- `listOrgEmployees()`, `setEmployeeBuilderAccess({employee_id, can_use_builder})`.
- `setAgentGovernance({skill_id, min_confidence, is_paused})`, `listAgentGovernance()`.
- `logActivity({action, meta})` — invoked by employee actions in skill-module.
- `listOrgActivity({limit})` — admin only.

All use `requireSupabaseAuth` middleware so RLS enforces org isolation.

### UI

- **`/signup`**: form (org name, full name, email, password) → on success, auto-login and route to `/dashboard`.
- **`/login`**: email/password; on success, redirect to `search.redirect` or role-based default (`admin → /dashboard`, `employee → /employee`).
- **`/join`**: code input + redeem; if not authenticated, prompt signup first.
- **AppHeader**: nav becomes role-aware. Adds avatar menu with org name, role badge, "Sign out". Hide unauthenticated marketing nav from logged-in users on app routes.
- **Admin Employees page**: "Generate invite code" button → modal showing code + copy button + expiry; table of employees with role, last activity, and "Builder access" toggle.
- **Admin Governance page**: list of skills (seeded from existing `tasks` array) with pause switch + confidence threshold slider. Saved values are read in `skill-module` and `employee` to drive the UI (e.g., disable deploy button if paused).
- **Skill-module page**: if `can_use_builder=false`, show locked state with "Request access" button (creates an activity-log entry).

### Files to add / change

- New: `supabase/migrations/<ts>_auth_orgs.sql`
- New: `src/lib/auth.functions.ts`, `src/lib/org.functions.ts`, `src/lib/auth-context.tsx`
- New routes: `_authed.tsx`, `_authed/_admin.tsx`, `_authed/admin.employees.tsx`, `_authed/admin.governance.tsx`, `_authed/dashboard.tsx`, `_authed/employee.tsx`, `_authed/skill-module.tsx`, `login.tsx`, `signup.tsx`, `join.tsx`
- Delete (after move): `src/routes/dashboard.tsx`, `src/routes/employee.tsx`, `src/routes/skill-module.tsx`
- Update: `src/router.tsx` (auth context type + QueryClient), `src/routes/__root.tsx` (provider), `src/components/AppShell.tsx` (role-aware nav + user menu)
- Update: `src/components/judging/AgentDeploymentBuilder.tsx` to read `is_paused` / `min_confidence` from governance store (server fn) and disable when paused

### Notes

- No social providers; email + password only (email confirmation **off** so invites flow doesn't break — matches existing project posture).
- All admin↔employee writes go through RLS-validated server functions; client never gets service role.
- The audit lead-capture flow remains untouched and public.

