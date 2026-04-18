import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Firecrawl from "@mendable/firecrawl-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { AuditReport, GenerateAuditResponse } from "@/lib/audit-types";

const InputSchema = z.object({
  website: z
    .string()
    .trim()
    .min(3)
    .max(255)
    .refine((v) => /\./.test(v), { message: "Enter a valid website (e.g. acme.com)" }),
  email: z.string().trim().email().max(255),
});

function normalizeUrl(input: string): { url: string; domain: string } {
  let raw = input.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  const u = new URL(raw);
  return { url: u.toString(), domain: u.hostname.replace(/^www\./, "") };
}

async function scrapeCompany(url: string) {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;
  try {
    const fc = new Firecrawl({ apiKey });
    const res = await fc.scrape(url, {
      formats: ["markdown"],
      onlyMainContent: true,
    });
    const md =
      "markdown" in res && res.markdown
        ? (res.markdown as string)
        : ((res as { data?: { markdown?: string } }).data?.markdown ?? "");
    const meta =
      (res as { metadata?: Record<string, unknown> }).metadata ??
      (res as { data?: { metadata?: Record<string, unknown> } }).data?.metadata ??
      {};
    return { markdown: (md || "").slice(0, 8000), metadata: meta };
  } catch (err) {
    console.error("Firecrawl scrape failed:", err);
    return null;
  }
}

async function enrichCompany(domain: string) {
  const apiKey = process.env.THECOMPANIESAPI_API_KEY;
  if (!apiKey) return null;
  try {
    const url = `https://api.thecompaniesapi.com/v2/companies/${encodeURIComponent(domain)}`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${apiKey}` },
    });
    if (!res.ok) {
      console.error(`TheCompaniesAPI error ${res.status}: ${await res.text()}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error("TheCompaniesAPI failed:", err);
    return null;
  }
}

const AUDIT_SYSTEM_PROMPT = `You are an enterprise AI deployment strategist for UpSkill USA — "The Reliable Autonomous Workforce Platform".

Your job: given enrichment data about a company (industry, size, tech stack, website content), produce a rigorous AI Readiness Audit:
- An "Autonomous Workforce Score" from 0–100 estimating what % of the company's workflows could realistically run end-to-end with AI agents at high reliability today.
- 4–6 concrete, department-level AI deployment opportunities with realistic hours-saved-per-week estimates.
- Risks specific to this company (compliance, data sensitivity, customer trust).
- 3 next steps the user should take.

Be concrete and reference what you know about THIS company (industry, size, products). Avoid generic advice. Avoid hype. No emojis.

Return ONLY valid JSON matching the provided schema. No markdown fences.`;

const auditJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "company_name",
    "industry",
    "size_estimate",
    "autonomous_workforce_score",
    "score_rationale",
    "executive_summary",
    "top_opportunities",
    "risks",
    "next_steps",
  ],
  properties: {
    company_name: { type: "string" },
    industry: { type: "string" },
    size_estimate: { type: "string" },
    autonomous_workforce_score: { type: "number", minimum: 0, maximum: 100 },
    score_rationale: { type: "string" },
    executive_summary: { type: "string" },
    top_opportunities: {
      type: "array",
      minItems: 3,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "title",
          "department",
          "description",
          "impact",
          "effort",
          "estimated_hours_saved_per_week",
        ],
        properties: {
          title: { type: "string" },
          department: { type: "string" },
          description: { type: "string" },
          impact: { type: "string", enum: ["High", "Medium", "Low"] },
          effort: { type: "string", enum: ["Low", "Medium", "High"] },
          estimated_hours_saved_per_week: { type: "number" },
        },
      },
    },
    risks: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 6 },
    next_steps: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
  },
} as const;

async function runOpenAiAudit(args: {
  domain: string;
  url: string;
  scrape: { markdown: string; metadata: Record<string, unknown> } | null;
  enrichment: unknown;
}): Promise<AuditReport> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  const userPayload = {
    domain: args.domain,
    url: args.url,
    scrape_summary: args.scrape?.markdown ?? null,
    scrape_metadata: args.scrape?.metadata ?? null,
    enrichment: args.enrichment ?? null,
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "ai_readiness_audit",
          strict: true,
          schema: auditJsonSchema,
        },
      },
      messages: [
        { role: "system", content: AUDIT_SYSTEM_PROMPT },
        {
          role: "user",
          content: `Generate the AI Readiness Audit for this company. Data:\n\n${JSON.stringify(
            userPayload,
            null,
            2,
          )}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${txt}`);
  }

  const json = (await res.json()) as {
    choices: { message: { content: string } }[];
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned no content");
  return JSON.parse(content) as AuditReport;
}

function renderEmailHtml(audit: AuditReport, website: string): string {
  const opp = audit.top_opportunities
    .map(
      (o) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eaeaea;">
          <div style="font-weight:600;color:#0f172a;">${escapeHtml(o.title)}</div>
          <div style="font-size:13px;color:#475569;margin-top:4px;">${escapeHtml(o.department)} · Impact: ${o.impact} · Effort: ${o.effort} · ~${o.estimated_hours_saved_per_week} hrs/wk</div>
          <div style="font-size:14px;color:#1f2937;margin-top:6px;">${escapeHtml(o.description)}</div>
        </td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0e7490;font-weight:700;">UpSkill USA · AI Readiness Audit</div>
    <h1 style="font-size:28px;line-height:1.2;margin:8px 0 4px;">${escapeHtml(audit.company_name)}</h1>
    <div style="color:#475569;font-size:14px;">${escapeHtml(website)} · ${escapeHtml(audit.industry)} · ${escapeHtml(audit.size_estimate)}</div>

    <div style="margin:28px 0;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.12em;color:#64748b;">Autonomous Workforce Score</div>
      <div style="font-size:56px;font-weight:800;color:#0e7490;line-height:1;margin-top:6px;">${Math.round(audit.autonomous_workforce_score)}<span style="font-size:24px;color:#94a3b8;">/100</span></div>
      <div style="font-size:14px;color:#334155;margin-top:10px;">${escapeHtml(audit.score_rationale)}</div>
    </div>

    <h2 style="font-size:18px;margin:28px 0 8px;">Executive Summary</h2>
    <p style="font-size:15px;line-height:1.6;color:#1f2937;">${escapeHtml(audit.executive_summary)}</p>

    <h2 style="font-size:18px;margin:28px 0 8px;">Top AI Deployment Opportunities</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #eaeaea;border-radius:12px;overflow:hidden;">${opp}</table>

    <h2 style="font-size:18px;margin:28px 0 8px;">Risks to Watch</h2>
    <ul style="padding-left:20px;color:#1f2937;font-size:14px;line-height:1.6;">
      ${audit.risks.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
    </ul>

    <h2 style="font-size:18px;margin:28px 0 8px;">Recommended Next Steps</h2>
    <ol style="padding-left:20px;color:#1f2937;font-size:14px;line-height:1.6;">
      ${audit.next_steps.map((r) => `<li>${escapeHtml(r)}</li>`).join("")}
    </ol>

    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eaeaea;font-size:12px;color:#64748b;">
      Generated by UpSkill USA — The Reliable Autonomous Workforce Platform.
    </div>
  </div>
</body></html>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function trySendAuditEmail(
  email: string,
  website: string,
  audit: AuditReport,
): Promise<boolean> {
  // Best-effort: only sends if a transactional email server route is wired up later.
  // We check by calling the standard internal route name; if it 404s, we silently skip.
  try {
    const baseUrl = process.env.LOVABLE_PUBLIC_URL ?? process.env.SUPABASE_URL ?? "";
    if (!baseUrl) return false;
    const html = renderEmailHtml(audit, website);
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/lovable/email/transactional/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: `Your AI Readiness Audit for ${audit.company_name}`,
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export const generateAudit = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<GenerateAuditResponse> => {
    const supabaseAdmin = getServerSupabase();
    let leadId: string | null = null;
    try {
      const { url, domain } = normalizeUrl(data.website);

      // 1. Insert lead row as pending
      const insert = await supabaseAdmin
        .from("leads")
        .insert({
          website: domain,
          email: data.email,
          status: "pending",
        })
        .select("id")
        .single();

      if (insert.error || !insert.data) {
        throw new Error(`Failed to create lead: ${insert.error?.message ?? "unknown error"}`);
      }
      leadId = insert.data.id as string;

      // 2. Enrich in parallel
      const [scrape, enrichment] = await Promise.all([scrapeCompany(url), enrichCompany(domain)]);

      // 3. Generate audit
      const audit = await runOpenAiAudit({ domain, url, scrape, enrichment });

      // 4. Try sending email (best-effort)
      const emailSent = await trySendAuditEmail(data.email, domain, audit);

      // 5. Persist results
      await supabaseAdmin
        .from("leads")
        .update({
          status: "completed",
          enrichment: JSON.parse(
            JSON.stringify({
              scrape_metadata: scrape?.metadata ?? null,
              companies_api: enrichment,
            }),
          ),
          audit: JSON.parse(JSON.stringify(audit)),
          updated_at: new Date().toISOString(),
        })
        .eq("id", leadId);

      return {
        ok: true,
        lead_id: leadId,
        website: domain,
        email: data.email,
        audit,
        email_sent: emailSent,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("generateAudit failed:", message);
      if (leadId) {
        await supabaseAdmin
          .from("leads")
          .update({ status: "failed", error: message, updated_at: new Date().toISOString() })
          .eq("id", leadId);
      }
      return { ok: false, error: message };
    }
  });
