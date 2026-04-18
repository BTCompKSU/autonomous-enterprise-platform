

## Plan: Skill Assessment Page (authed)

A new authenticated route where employees take an assessment, submit answers, and get an AI-generated analysis. Place it under the `_authed` guard so only logged-in org members reach it.

### Route

`src/routes/_authed/assessment.tsx` → `/assessment`

Visible to both employees and admins (admins for previewing). Add a nav link in `AppShell` for authenticated users.

### UI flow (single page, three states)

1. **Intake** — multi-step form. Questions are defined in a typed array at the top of the file so we can iterate quickly. Supports these question types out of the box:
   - `single_choice` (radio)
   - `multi_choice` (checkboxes)
   - `scale` (1–5 slider)
   - `short_text` (textarea, 500-char cap)
   
   Progress bar + "Back / Next" nav. Validates each step before advancing (zod).

2. **Submitting** — button shows spinner; calls `submitAssessment` server fn which:
   - validates payload
   - inserts an `assessments` row (status `pending`, answers jsonb)
   - calls Lovable AI (`google/gemini-2.5-pro`) with a system prompt + the answers, expecting structured JSON
   - updates the row with `analysis` jsonb + status `completed` (or `failed` + error)
   - returns the analysis to the client

3. **Result** — renders the analysis: overall readiness score, strengths, gaps, recommended next skills, and 2–3 suggested AI agents to deploy. Includes "Retake" and "Save & view in dashboard" buttons.

### Data model (one migration)

```text
assessments
  id uuid pk
  org_id uuid              -- = profile.org_id
  user_id uuid             -- = auth.uid()
  status text              -- pending | completed | failed
  answers jsonb            -- {questionId: value}
  analysis jsonb           -- AI output
  error text
  created_at, updated_at timestamptz
```

RLS:
- `SELECT`: own rows OR admin of same org
- `INSERT/UPDATE/DELETE`: blocked directly; all writes go through SECURITY DEFINER RPCs (same pattern we just used for `leads` to avoid the env-key loop)

RPCs:
- `create_assessment(_answers jsonb) returns uuid` — inserts `pending` row for `auth.uid()` + their `org_of(auth.uid())`
- `finalize_assessment(_id uuid, _status text, _analysis jsonb, _error text)` — updates row, only if `user_id = auth.uid()`

### Server function

`src/lib/assessment.functions.ts` — `submitAssessment({answers})`:
- uses `requireSupabaseAuth` middleware (JWT-bound supabase client)
- calls `create_assessment` RPC → gets `id`
- calls Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) with `LOVABLE_API_KEY`, `response_format: { type: "json_object" }`, model `google/gemini-2.5-pro`
- parses + validates the JSON
- calls `finalize_assessment` RPC with the result
- returns `{ ok: true, assessment_id, analysis }` (or `{ ok: false, error }`)

Handles 429 / 402 from the gateway with friendly messages.

### Files

**New**
- `supabase/migrations/<ts>_assessments.sql` — table + RLS + 2 RPCs
- `src/lib/assessment-types.ts` — `Question`, `Answer`, `AssessmentAnalysis` types
- `src/lib/assessment.functions.ts` — `submitAssessment` server fn
- `src/routes/_authed/assessment.tsx` — the page

**Edit**
- `src/components/AppShell.tsx` — add "Assessment" nav link for authed users

### Open follow-ups (not in this plan, ask after build)
- Whether admins should see a list of all assessments in their org on `/admin/employees`
- Whether the existing `tasks` array in `skill-module.tsx` should be replaced by results from the latest assessment

