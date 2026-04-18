

## Plan: Multi-step onboarding flow → Agent Builder

I'll add a 4-step onboarding flow at `/onboarding/*` that captures role → department → tasks → analyzes, then hands the profile to the existing dashboard.

### Files to create

1. **`src/lib/job-categories.ts`** — Hardcoded `enterprise_job_categories` JSON (9 departments × ~30 skills each) + the 10 quick-pick role definitions (each mapping to a default department + skill subset for fuzzy matching).

2. **`src/lib/onboarding-store.ts`** — Tiny localStorage-backed store with typed getters/setters for `{ selected_role, selected_department, selected_tasks, custom_tasks }`. No external state lib; just a small hook `useOnboardingProfile()`.

3. **`src/routes/onboarding.tsx`** — Layout route with `<Outlet />`, persistent header (logo → resets flow, "Skip for now →" link), and the amber 4-segment progress bar driven by current pathname.

4. **`src/routes/onboarding.index.tsx`** — Redirects `/onboarding` → `/onboarding/step-1`.

5. **`src/routes/onboarding.step-1.tsx`** — "What do you do all day?" 10 role cards in 4-col grid (2-col mobile) + freeform text input with fuzzy-match dropdown against category names + skills. Continue disabled until selection or 3+ chars typed.

6. **`src/routes/onboarding.step-2.tsx`** — 9 department cards (3-col / 2-col mobile) with lucide icons (Crown, Settings, DollarSign, TrendingUp, Megaphone, Code, Brain, Users, Scale). Shows the Step 1 selection as an editable chip up top. Auto-suggests department based on Step 1 role.

7. **`src/routes/onboarding.step-3.tsx`** — Pulls the selected department's `skills` array, renders as togglable amber pills. Live count, encouragement message, custom-task input (Enter to add). "Analyze My Role →" disabled under 3 selections.

8. **`src/routes/onboarding.step-4.tsx`** — Animated checklist (✓ Role identified, ⟳ Analyzing tasks, etc. revealed every 600ms), circular amber progress ring with pulsing Sparkles icon, rotating fun-fact card every 1.5s. Final state: large checkmark + "See My AI Opportunity →" button. Auto-redirects to `/dashboard` after ~3.5s.

### Wiring into existing app

- **Entry point**: Add a "Start your profile →" link from `/` (index) into `/onboarding`. The existing `/dashboard` keeps working with the default Maria Reyes data when the user skips.
- **Profile handoff**: `/dashboard` (or whichever the existing Agent Builder shell is — I'll check `_authed/_admin/dashboard.tsx`) reads `useOnboardingProfile()` on mount; if a profile exists, swap the sidebar name/role and pre-filter the task list to the user's department. If empty, fall back to current Maria Reyes mock. This is additive — zero risk to current demo.

### Design tokens

Reuses existing `--brand` (logo navy), `--warning` (amber/gold), `--success` (green) from `styles.css`. The "amber" in the spec maps to the existing `text-warning` / `bg-warning` token set already used for the "Author" category, so this stays consistent with the recent color-unification work. No new CSS variables needed.

### Animations

Uses the existing `animate-fade-in`, `animate-scale-in`, `hover-scale` utilities from the project's animation set. Step transitions use `animate-fade-in` on each route's root. Pill bounce + button pulse via Tailwind `transition-transform` + a one-shot `animate-scale-in` when enabled. No new keyframes.

### Routing notes

- TanStack flat dot-routing: `onboarding.tsx` (layout) + `onboarding.step-1.tsx` etc. (children).
- Logo click and "Skip" use `<Link to="/onboarding/step-1">` and `<Link to="/dashboard">` — type-safe, no string interpolation.
- Back/Continue buttons are `<Link>`s, not `useNavigate`, so cmd-click and preloading work.
- No search params needed — state lives in localStorage so refresh doesn't lose progress.

### Out of scope (flag for later)

- Server persistence of the profile (currently localStorage only).
- Auth gating — onboarding is public; dashboard handoff works whether or not the user is signed in.
- Analytics events on each step.

