

## Plan: Step 3 = real AI analysis + employee-style report

Step 3 is currently a fake animation that auto-redirects to `/workflowai`. I'll turn it into a real analysis page: it calls the AI with the user's department + selected skills, renders a personalized report styled like `preview.employee-analysis.tsx`, then offers a CTA into `/workflowai`.

### Backend: new public server function

The existing `submitAssessment` requires auth and writes to the DB. Since onboarding is unauthenticated, I'll add a sibling server function `analyzeOnboarding` (no auth, no persistence) that:

- Reuses the same `SYSTEM_PROMPT`, `roleAnalysisSchema`, and `runAnalysis()` logic from `src/lib/assessment.functions.ts` (extracted to avoid duplication).
- Builds the user message from `{ department, skills }` instead of free-form answers — explicitly tells the model "the employee has confirmed these skills as their day-to-day work" so the generated tasks anchor to them.
- Returns the same `RoleAnalysis` shape (`tasks` with bucket/hours/confidence/etc.).

File: **`src/lib/onboarding-analysis.functions.ts`** — new file with `analyzeOnboarding` server fn. Refactor `assessment.functions.ts` to export `runAnalysis` + the schema so both call sites share it.

### Frontend: rewrite Step 3

**`src/routes/onboarding.step-3.tsx`** becomes two phases:

1. **Loading phase** (~3–8s while AI runs): keep the existing animated ring + checklist + rotating facts. Kick off the server call on mount via `useMutation` (TanStack Query is already in the project). On error: show a friendly message + Retry button.

2. **Result phase** (when AI returns): render an employee-analysis-style report:
   - Header: department + N skills analyzed + "Hours saved/month" + "FTE equivalent" + readiness band (derived from automate %).
   - Three KPI tiles: `Automate / Augment / Own` counts (mirrors the preview report's `BigStat`).
   - Task-by-task breakdown list — same visual treatment as `preview.employee-analysis.tsx`: bucket pill, task name, "Xh → Yh" mono numbers, colored progress bar showing % time saved. Pull `monthly_hours_saved` and `avg_minutes_per_instance × instances_per_month` to derive before/after.
   - "Recommended AI tools" section: dedupe `tools_suggested` across tasks, show top ~6.
   - CTA at bottom: **"Enter WorkflowAI →"** → `Link to="/workflowai"`. Keep a secondary "← Back to tasks" link.

3. **Persist the analysis** to localStorage (extend `OnboardingProfile` with optional `analysis: RoleAnalysis | null`) so refreshing Step 3 doesn't re-bill the AI, and so `/workflowai` can later read the user's actual data.

### Files

| File | Change |
|---|---|
| `src/lib/assessment.functions.ts` | Export `runAnalysis` + `roleAnalysisSchema` + `SYSTEM_PROMPT` for reuse. |
| `src/lib/onboarding-analysis.functions.ts` | **New.** Public `analyzeOnboarding({ department, skills })` server fn. |
| `src/lib/onboarding-store.ts` | Add `analysis?: RoleAnalysis \| null` to profile + EMPTY. |
| `src/routes/onboarding.step-3.tsx` | Rewrite: real AI call → loading → report → CTA. |
| `src/routes/onboarding.tsx` | Update header description from "4-step" → "3-step". |

### Notes

- Uses `google/gemini-2.5-pro` (already configured in `runAnalysis`) — no new secrets needed; `LOVABLE_API_KEY` is set.
- Keeps the auto-redirect behavior off — the user explicitly clicks "Enter WorkflowAI" after seeing their report (the report IS the payoff of the onboarding).
- No DB writes from onboarding — analysis lives only in localStorage. Hooking it into `/workflowai`'s sidebar/data is still out of scope (flagged earlier).

