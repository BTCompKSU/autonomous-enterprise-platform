import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { RoleAnalysis, SubmitAssessmentResponse } from "@/lib/assessment-types";

const AnswerValueSchema = z.union([z.string(), z.array(z.string()), z.number()]);
const InputSchema = z.object({
  answers: z.record(z.string(), AnswerValueSchema),
});

export const SYSTEM_PROMPT = `You are an expert organizational designer and AI transformation consultant with deep knowledge of corporate structures, workforce automation, and human-AI collaboration frameworks.

## YOUR MISSION

Given a corporate job role (e.g., "Accounts Receivable Specialist"), you will:
1. Generate a comprehensive list of common tasks performed in that role
2. Analyze each task and classify it into one of three buckets: AUTOMATE, AUGMENT, or OWN
3. Return structured JSON data with time savings estimates and justifications

---

## STEP 1 — TASK GENERATION

For the given role, generate 10–20 realistic, specific tasks that professionals in this role perform daily, weekly, or monthly. Tasks should span:
- Data entry & processing
- Communication & coordination
- Analysis & reporting
- Decision-making & judgment calls
- Compliance & oversight
- Relationship management

---

## STEP 2 — CLASSIFICATION FRAMEWORK

Classify each task into exactly one of these three buckets:

### AUTOMATE
Definition: Tasks that can be fully handled by AI/software with no human involvement needed.
Criteria:
  - Highly repetitive and rule-based
  - Structured data inputs and predictable outputs
  - No nuanced judgment, empathy, or ethical reasoning required
  - Error-prone when done manually at scale
  - High volume, low complexity
Examples: Data entry, invoice matching, generating standard reports, sending templated emails, reconciliation of transactions, flagging anomalies via rules

### AUGMENT
Definition: Tasks where AI assists the human, making them faster, more accurate, or better informed — but a human retains meaningful involvement and final judgment.
Criteria:
  - Requires human interpretation, context, or relationship awareness
  - AI can draft, suggest, analyze, or surface insights
  - Output quality improves significantly with AI assistance
  - Human oversight adds compliance, accountability, or nuance
  - Moderate complexity with variable inputs
Examples: Drafting dispute resolution emails, prioritizing collections calls, summarizing aging reports for leadership, forecasting cash flow

### OWN
Definition: Tasks that must remain fully human-led. AI may provide background data, but humans drive and own the process, relationships, and decisions.
Criteria:
  - High emotional intelligence or interpersonal sensitivity required
  - Involves legal, ethical, or strategic accountability
  - Requires organizational trust, authority, or negotiation
  - Outcomes significantly affect people, clients, or regulatory standing
  - Low repeatability, high context-dependence
Examples: Negotiating payment terms with key clients, handling escalated disputes, presenting financial risk to executives, mentoring team members

---

## STEP 3 — TIME SAVINGS ESTIMATION METHODOLOGY

For AUTOMATE tasks, estimate time savings using this formula:
  - Baseline: Average minutes/hours a human spends on this task (per instance)
  - Frequency: How often the task occurs (daily/weekly/monthly)
  - Automation rate: 85–100% time reduction for full automation
  - Monthly hours saved = (time per instance × frequency per month) × automation rate

For AUGMENT tasks:
  - Automation rate: 30–65% time reduction (human still involved but faster)
  - Factor in: drafting speed, error reduction, fewer revision cycles

For OWN tasks:
  - Automation rate: 0–15% (AI may save research/prep time only)
  - Note any AI-assisted prep work that reduces burden

Use industry benchmarks where applicable:
  - Manual invoice processing: ~15–20 min/invoice
  - Collections call prep: ~10–15 min/account
  - Monthly close reconciliation: ~2–4 hours
  - Report generation: ~1–3 hours
  - Email response (complex): ~10–20 min

---

## BEHAVIOR RULES

- Always generate tasks BEFORE classifying — don't skip task generation
- Be specific: avoid vague tasks like "manages data" — say "reconciles daily payment postings against bank statements"
- Never classify a task as AUTOMATE if it involves legal signing authority, client relationship ownership, or ethical judgment
- If a task could fit two buckets, choose the more conservative (human-forward) option and note it in the rationale
- Monthly hours saved must be mathematically consistent: (avg_minutes_per_instance × instances_per_month / 60) × (automation_rate_pct / 100)
- "estimated_fte_equivalent_saved" assumes 160 working hours/month
- "confidence" reflects how certain the estimate is based on task standardization
- "tools_suggested" should name real AI/automation tools (e.g., UiPath, Copilot, GPT-4, Salesforce Einstein, Bill.com, Tesseract OCR, Zapier, etc.)

Return ONLY valid JSON via the provided tool. No prose. No markdown. No emojis.`;

const HOURS_FREQ_HINT: Record<string, string> = {
  "1": "less than 2 hours/week",
  "2": "2–5 hours/week",
  "3": "5–10 hours/week",
  "4": "10–20 hours/week",
  "5": "20+ hours/week",
};

function buildUserMessage(answers: Record<string, unknown>): string {
  const role = (answers.role as string) || "Unspecified role";
  const department = (answers.department as string) || "unspecified";
  const repetitive = (answers.repetitive_tasks as string) || "";
  const hours = answers.hours_repetitive != null ? HOURS_FREQ_HINT[String(answers.hours_repetitive)] : "";
  const goal = (answers.goal as string) || "";

  const context: string[] = [];
  if (department) context.push(`Department: ${department}`);
  if (repetitive) context.push(`Most repetitive weekly task (self-reported): ${repetitive}`);
  if (hours) context.push(`Time spent on repetitive work: ${hours}`);
  if (goal) context.push(`Stated goal for AI this quarter: ${goal}`);

  return [
    `Analyze this role: ${role}`,
    "",
    context.length > 0 ? "Additional context from the employee (use to ground task selection, do not quote verbatim):" : "",
    ...context.map((c) => `- ${c}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export const roleAnalysisSchema = {
  type: "object",
  additionalProperties: false,
  required: ["role", "department", "total_tasks_analyzed", "summary", "tasks"],
  properties: {
    role: { type: "string" },
    department: { type: "string" },
    total_tasks_analyzed: { type: "number" },
    summary: {
      type: "object",
      additionalProperties: false,
      required: [
        "automate_count",
        "augment_count",
        "own_count",
        "estimated_monthly_hours_saved",
        "estimated_fte_equivalent_saved",
      ],
      properties: {
        automate_count: { type: "number" },
        augment_count: { type: "number" },
        own_count: { type: "number" },
        estimated_monthly_hours_saved: { type: "number" },
        estimated_fte_equivalent_saved: { type: "number" },
      },
    },
    tasks: {
      type: "array",
      minItems: 10,
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "task_id",
          "task_name",
          "description",
          "frequency",
          "avg_minutes_per_instance",
          "instances_per_month",
          "bucket",
          "rationale",
          "ai_action",
          "automation_rate_pct",
          "monthly_hours_saved",
          "confidence",
          "tools_suggested",
        ],
        properties: {
          task_id: { type: "number" },
          task_name: { type: "string" },
          description: { type: "string" },
          frequency: { type: "string", enum: ["daily", "weekly", "monthly", "ad-hoc"] },
          avg_minutes_per_instance: { type: "number" },
          instances_per_month: { type: "number" },
          bucket: { type: "string", enum: ["AUTOMATE", "AUGMENT", "OWN"] },
          rationale: { type: "string" },
          ai_action: { type: "string" },
          automation_rate_pct: { type: "number", minimum: 0, maximum: 100 },
          monthly_hours_saved: { type: "number" },
          confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
          tools_suggested: { type: "array", items: { type: "string" } },
        },
      },
    },
  },
} as const;

export async function runAnalysis(answers: Record<string, unknown>): Promise<RoleAnalysis> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(answers) },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_role_analysis",
            description: "Return the structured role-based AUTOMATE/AUGMENT/OWN analysis.",
            parameters: roleAnalysisSchema,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "submit_role_analysis" } },
    }),
  });

  if (res.status === 429) {
    throw new Error("Rate limit reached. Please wait a moment and try again.");
  }
  if (res.status === 402) {
    throw new Error("AI credits exhausted for this workspace. Add credits in Settings → Workspace → Usage.");
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway error ${res.status}: ${txt.slice(0, 300)}`);
  }

  const json = (await res.json()) as {
    choices: { message: { tool_calls?: { function: { arguments: string } }[] } }[];
  };
  const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("AI returned no structured output");
  return JSON.parse(args) as RoleAnalysis;
}

export const submitAssessment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }): Promise<SubmitAssessmentResponse> => {
    const { supabase } = context;
    let assessmentId: string | null = null;

    try {
      const create = await supabase.rpc("create_assessment", {
        _answers: data.answers as never,
      });
      if (create.error || !create.data) {
        throw new Error(create.error?.message ?? "Failed to create assessment");
      }
      assessmentId = create.data as string;

      const analysis = await runAnalysis(data.answers);

      await supabase.rpc("finalize_assessment", {
        _id: assessmentId,
        _status: "completed",
        _analysis: JSON.parse(JSON.stringify(analysis)),
        _error: null as unknown as string,
      });

      return { ok: true, assessment_id: assessmentId, analysis };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("submitAssessment failed:", message);
      if (assessmentId) {
        await supabase.rpc("finalize_assessment", {
          _id: assessmentId,
          _status: "failed",
          _analysis: null,
          _error: message,
        });
      }
      return { ok: false, error: message };
    }
  });
