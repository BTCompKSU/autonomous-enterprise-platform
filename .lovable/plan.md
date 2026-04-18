

## Code Review — Loose Ends to Clean Up

After auditing routes, server functions, and nav, here are the real issues remaining. Most are residue from the recent auth-header refactor and the nav cleanup.

### 1. Server functions still missing auth headers (will 401 → blank screen)

`requireSupabaseAuth` middleware is on these functions but the call sites don't pass `authHeaders()`:

- **`submitAssessment`** in `src/routes/_authed/assessment.tsx` line 196 — `await submitAssessment({ data: { answers } })` has no headers. First user to take the assessment hits the same `[object Response]` blank screen we just fixed elsewhere.
- **`analyzeOnboarding`** in `src/lib/onboarding-analysis.functions.ts` does NOT use `requireSupabaseAuth` — fine, leave it. But verify it stays public since the onboarding flow is unauthenticated.

Fix: add `headers: await authHeaders()` to the `submitAssessment` call.

### 2. Stale `/skill-module` and `/assessment` links after nav cleanup

We removed these from the nav (correctly — they show demo/dummy data), but they're still reachable via:

- `src/routes/opportunity.tsx` line 53 — "View skill module" button → `/skill-module`
- `src/routes/_authed/assessment.tsx` line 616 — "Open Emulator Builder" → `/skill-module`

Since `/skill-module` and `/assessment` live under `_authed`, marketing visitors clicking these from `/opportunity` get bounced to `/login`. Two options:

- **A (recommended):** Point `/opportunity`'s link to the public preview `/preview/agent-builder` instead of `/skill-module`. Keep the routes themselves alive for direct-link demos.
- **B:** Delete `/skill-module` and `/assessment` route files entirely.

I'll go with **A** — preserves the demo URLs the team has been sharing, just stops marketing visitors from hitting the auth wall.

### 3. Redundant guard in `join.tsx`

We added BOTH a `useEffect` redirect (lines 33-38) AND a submit-handler guard (lines 66-70) for "already in an org." The effect already covers it before the form can be submitted. The submit guard is dead code; remove for clarity.

### 4. Dead/orphaned route files

- `src/routes/step-1.tsx`, `step-2.tsx`, `step-3.tsx` — top-level redirect stubs to `/onboarding/step-X`. Harmless but unused; safe to leave for backward-compat with old shared links. **Leave.**

### 5. Hard-coded `[1]?.toUpperCase()` crash risk in AppShell

Line 102: `(auth.fullName ?? auth.user?.email ?? "?")[0]?.toUpperCase()` — when both are nullish it falls back to `"?"` which is fine. Already safe. **No change.**

### 6. Onboarding header overlap with global `<AppHeader />`

`src/routes/onboarding.tsx` renders its own dark header AND the global `AppHeader` is also mounted in `__root.tsx`. So onboarding pages show two headers stacked. Confirmed by reading both files.

Fix: Either hide `AppHeader` on `/onboarding/*` routes, or remove the inner onboarding header. Cleanest: in `AppHeader`, return `null` when `pathname.startsWith("/onboarding")`.

### 7. Same double-header issue on `/assessment`

`assessment.tsx` line 17 imports and renders `<AppHeader />` itself (line 220). Since it's already mounted globally in `__root.tsx`, this renders the header twice. Remove the import + `<AppHeader />` usage in `assessment.tsx`.

---

## Files to change

| File | Change |
|---|---|
| `src/routes/_authed/assessment.tsx` | Add `authHeaders()` to `submitAssessment` call; remove duplicate `<AppHeader />` and its import |
| `src/routes/opportunity.tsx` | Repoint `/skill-module` link → `/preview/agent-builder` |
| `src/routes/join.tsx` | Drop the redundant `auth.orgId` block in `submit` (lines 66-70) |
| `src/components/AppShell.tsx` | Hide global header on `/onboarding/*` routes |

No DB or schema changes. No new files.

