import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RoleAnalysis } from "@/lib/assessment-types";
import { roleAnalysisSchema, SYSTEM_PROMPT } from "@/lib/assessment.functions";

// Gemini's structured-output engine rejects schemas with minItems/maxItems
// on arrays of complex objects ("too many states for serving"). We strip
// those constraints here and enforce the 10–20 task target via the prompt.
const roleAnalysisSchemaLoose = (() => {
  const clone = JSON.parse(JSON.stringify(roleAnalysisSchema)) as {
    properties: { tasks: { minItems?: number; maxItems?: number } };
  };
  delete clone.properties.tasks.minItems;
  delete clone.properties.tasks.maxItems;
  return clone;
})();

const InputSchema = z.object({
  department: z.string().min(1).max(120),
  skills: z.array(z.string().min(1).max(160)).min(1).max(40),
});

export type AnalyzeOnboardingResponse =
  | { ok: true; analysis: RoleAnalysis }
  | { ok: false; error: string };

function buildUserMessage(department: string, skills: string[]): string {
  return [
    `Analyze this role: ${department} professional`,
    "",
    `Department: ${department}`,
    "",
    "The employee has confirmed the following skills/responsibilities as their day-to-day work. Anchor your generated tasks to these — every skill below should map to at least one concrete task in your output:",
    ...skills.map((s) => `- ${s}`),
    "",
    "Treat this skill list as ground truth for what this person actually does. Do not invent tasks unrelated to these skills, but you may add 2-4 supporting/adjacent tasks that naturally co-occur.",
  ].join("\n");
}

async function runOnboardingAnalysis(
  department: string,
  skills: string[],
): Promise<RoleAnalysis> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserMessage(department, skills) },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "submit_role_analysis",
            description: "Return the structured role-based AUTOMATE/AUGMENT/OWN analysis. Return between 10 and 20 tasks.",
            parameters: roleAnalysisSchemaLoose,
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

export const analyzeOnboarding = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<AnalyzeOnboardingResponse> => {
    try {
      const analysis = await runOnboardingAnalysis(data.department, data.skills);
      return { ok: true, analysis };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("analyzeOnboarding failed:", message);
      return { ok: false, error: message };
    }
  });
