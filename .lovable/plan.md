

## Plan: Swap analysis to role-based AUTOMATE/AUGMENT/OWN framework

The new prompt is **role-centric**: input is a job title, output is 10–20 tasks classified into AUTOMATE / AUGMENT / OWN with time-savings math. This is a different shape than the current "readiness score + strengths/gaps" output. The intake form already collects `role` and `department`, so we keep the form intact and feed those (plus the rest of the answers as context) to the new agent.

### 1. New types — `src/lib/assessment-types.ts`

Add (keep existing `AssessmentAnalysis` for backwards-compat, but stop using it):

```ts
type Bucket = "AUTOMATE" | "AUGMENT" | "OWN";
type Confidence = "HIGH" | "MEDIUM" | "LOW";

interface RoleTask {
  task_id: number;
  task_name: string;
  description: string;
  frequency: "daily" | "weekly" | "monthly" | "ad-hoc";
  avg_minutes_per_instance: number;
  instances_per_month: number;
  bucket: Bucket;
  rationale: string;
  ai_action: string;
  automation_rate_pct: number;
  monthly_hours_saved: number;
  confidence: Confidence;
  tools_suggested: string[];
}

interface RoleAnalysis {
  role: string;
  department: string;
  total_tasks_analyzed: number;
  summary: {
    automate_count: number;
    augment_count: number;
    own_count: number;
    estimated_monthly_hours_saved: number;
    estimated_fte_equivalent_saved: number;
  };
  tasks: RoleTask[];
}
```

`SubmitAssessmentResponse` becomes `{ ok: true; assessment_id; analysis: RoleAnalysis } | { ok: false; error }`.

### 2. Server fn — `src/lib/assessment.functions.ts`

- Replace `SYSTEM_PROMPT` with the full agent prompt provided.
- User message: `Analyze this role: ${answers.role}` plus a short context block with department, repetitive tasks, hours, and goal so the model has grounding (these directly improve task selection).
- Replace `analysisSchema` with a JSON schema matching `RoleAnalysis` (used via the existing tool-calling pattern — keeps responses strictly valid).
- Keep the `create_assessment` / `finalize_assessment` RPC flow as-is — `analysis` is `jsonb`, so the new shape stores fine without a migration.

### 3. Result UI — `src/routes/_authed/assessment.tsx` (`ResultView`)

Rebuild the result screen for the new payload:

- **Header**: role + department, "X tasks analyzed".
- **3 KPI cards**: monthly hours saved, FTE-equivalent saved, bucket breakdown (e.g. "12 Automate · 5 Augment · 3 Own").
- **Bucket sections** (Automate / Augment / Own): each task as a row showing name, frequency × minutes, monthly hours saved, confidence chip, and an expandable details area with rationale, ai_action, and tools_suggested as small chips.
- Color tokens reuse the existing pattern from `preview.employee-analysis.tsx`: success (Automate), brand (Augment), primary (Own).
- Keep "Retake" button.

### 4. No DB migration needed

`assessments.analysis` is `jsonb`; old rows with the prior shape remain readable but aren't displayed (we always show the latest submission's in-memory result). If you want a history view later, it's a follow-up.

### Files

**Edit**: `src/lib/assessment-types.ts`, `src/lib/assessment.functions.ts`, `src/routes/_authed/assessment.tsx`

No new files. No migration. No nav changes.

### Open follow-up (not in this plan)

If you'd rather make this a **two-step flow** (collect role → show role analysis → optionally collect employee context for a personal readiness layer), say so and I'll restructure. Current plan keeps the existing single submission and replaces the output entirely.

