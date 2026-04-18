import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AssessmentAnalysis, SubmitAssessmentResponse } from "@/lib/assessment-types";

const AnswerValueSchema = z.union([z.string(), z.array(z.string()), z.number()]);
const InputSchema = z.object({
  answers: z.record(z.string(), AnswerValueSchema),
});

const SYSTEM_PROMPT = `You are a workforce-transformation analyst for UpSkill USA — "The Reliable Autonomous Workforce Platform".

You receive an employee's self-assessment about their role, current AI usage, comfort with automation, repetitive tasks, and goals. Produce a rigorous, personalized AI Readiness Analysis.

Be specific to their stated role and tasks. Avoid generic platitudes. No emojis. No markdown.

Return ONLY valid JSON conforming to the schema. No prose outside JSON.`;

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "readiness_score",
    "readiness_band",
    "summary",
    "strengths",
    "gaps",
    "recommended_skills",
    "recommended_agents",
    "next_actions",
  ],
  properties: {
    readiness_score: { type: "number", minimum: 0, maximum: 100 },
    readiness_band: { type: "string", enum: ["Emerging", "Developing", "Proficient", "Advanced"] },
    summary: { type: "string" },
    strengths: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
    gaps: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
    recommended_skills: {
      type: "array",
      minItems: 3,
      maxItems: 5,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["skill", "rationale", "priority"],
        properties: {
          skill: { type: "string" },
          rationale: { type: "string" },
          priority: { type: "string", enum: ["High", "Medium", "Low"] },
        },
      },
    },
    recommended_agents: {
      type: "array",
      minItems: 2,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "purpose", "why_now", "estimated_hours_saved_per_week"],
        properties: {
          name: { type: "string" },
          purpose: { type: "string" },
          why_now: { type: "string" },
          estimated_hours_saved_per_week: { type: "number" },
        },
      },
    },
    next_actions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
  },
} as const;

async function runAnalysis(answers: Record<string, unknown>): Promise<AssessmentAnalysis> {
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
        {
          role: "user",
          content: `Analyze this employee's skill assessment and return the JSON object only.\n\nAnswers:\n${JSON.stringify(answers, null, 2)}`,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_assessment_analysis",
            description: "Return the structured assessment analysis.",
            parameters: analysisSchema,
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "submit_assessment_analysis" } },
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
  return JSON.parse(args) as AssessmentAnalysis;
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
