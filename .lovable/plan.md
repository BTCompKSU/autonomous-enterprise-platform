
## Two fixes for Step 3

### 1. Fix the "We need your department…" flash on refresh

**Root cause:** `useOnboardingProfile` initializes state to `EMPTY` and only loads from localStorage inside a `useEffect` after mount. So on first render `selected_department=""` and the guard at line 61 of `onboarding.step-3.tsx` instantly renders the "Start over" card. A tick later the profile hydrates and the report comes back. Same issue would affect any refresh of step 2/3.

**Fix (in `src/lib/onboarding-store.ts`):** add a `hydrated` boolean to the hook return value — `false` until the post-mount `useEffect` runs and reads localStorage, then `true`.

**Fix (in `src/routes/onboarding.step-3.tsx`):**
- Pull `hydrated` from the hook.
- While `!hydrated`, render the existing `<LoadingPhase />` (or a tiny "Loading…" placeholder) instead of evaluating the guard.
- Only check the `!selected_department || allSkills.length === 0` guard after hydration.
- Same one-line guard fix in `onboarding.step-2.tsx` so a refresh there doesn't briefly show "Pick a department first."

No change to localStorage shape, no analysis re-trigger, no extra renders for users already past hydration.

### 2. Add a sample-report-style summary block at the bottom of Step 3's report

Mirror the bottom of `preview.executive-audit.tsx` — a navy "unlock / next step" CTA card + a methodology footnote — adapted to the employee context. Insert it inside `ReportPhase` **after** the "Recommended AI tools" card and **before** the existing back/Open-Emulation-Station button row.

**A. Navy roadmap CTA card** (visual twin of the executive-audit lock card):
- Eyebrow pill: "Your skill roadmap is ready"
- Headline: "Turn this into your daily AI workflow."
- 3 bullets with check icons, derived from this user's analysis:
  - "Customize **Invoice Generation** (and {automate_count - 1} more) inside Emulation Station" *(swap "Invoice Generation" for the highest-hours-saved AUTOMATE task name; falls back gracefully if none)*
  - "Reclaim **{hours}h/month** — that's **{fte} FTE** of your week back"
  - "Keep authoring the **{own_count}** tasks only you can do"
- Primary button → `/workflowai` "Open Emulation Station →" (kept consistent with the existing CTA, which then disappears since this replaces it).
- Secondary text link below: "← Back to tasks".

**B. Methodology footer strip** (slate-50 band, same pattern as exec audit lines 282–288):
> *Methodology: hours derived from your reported task volume × industry-standard time-per-instance, with AI savings modeled per task type (Automate / Augment / Author). Estimates refresh whenever you add or remove skills.*

**C. Cleanup:** remove the now-duplicated standalone "Open Emulation Station" button row at the very bottom (lines ~327–342) since the new card carries the primary CTA. Keep only a small left-aligned "← Back to tasks" beneath the methodology strip — matches the sample report's flow.

### Files touched
- `src/lib/onboarding-store.ts` — add `hydrated` flag.
- `src/routes/onboarding.step-3.tsx` — gate guard on `hydrated`; add bottom summary card + methodology strip; remove duplicate CTA row.
- `src/routes/onboarding.step-2.tsx` — gate the "Pick a department first" guard on `hydrated` to prevent the same flash on refresh.

### Out of scope
- Persisting the analysis server-side (still localStorage-only).
- Restyling the existing tiles or task list.
