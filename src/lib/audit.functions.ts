import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Firecrawl from "@mendable/firecrawl-js";
import { supabase } from "@/integrations/supabase/client";
import type { AuditReport, GenerateAuditResponse, PainCategory } from "@/lib/audit-types";
import { computeCostModel, formatNumber, formatUsdShort } from "@/lib/cost-model";

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

Given enrichment data about a company, produce a SHORT diagnostic that names operational pain — but does NOT prescribe solutions. Your output drives motivation; the actual playbook is gated behind signup.

Required outputs:
- "Autonomous Workforce Score" (0–100): the % of this company's workflows that could realistically run end-to-end with AI agents at high reliability today. Calibrate based on industry, size, and tech stack signals.
- score_rationale: 1–2 sentences explaining the score, citing specific signals from the data.
- executive_summary: EXACTLY 2 sentences. Open with the operational reality at this company. Close with the strategic risk of waiting. Do NOT mention specific AI solutions, vendors, or playbook items.
- pain_categories: 3–4 items. Each has a "department" (e.g. Finance, Customer Operations) and a "symptom" — a one-sentence description of the WORK that is currently manual and repetitive at this company. NAME THE WOUND, NEVER THE BANDAGE. Do not say "could be automated", "AI agents could", or recommend any tool/process.

Tone: serious, executive, defensible. No hype, no emojis, no marketing language. Every claim should sound like it came from a McKinsey diagnostic, not a sales deck.

Return ONLY valid JSON matching the provided schema.`;

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
    "pain_categories",
  ],
  properties: {
    company_name: { type: "string" },
    industry: { type: "string" },
    size_estimate: { type: "string" },
    autonomous_workforce_score: { type: "number", minimum: 0, maximum: 100 },
    score_rationale: { type: "string" },
    executive_summary: { type: "string" },
    pain_categories: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["department", "symptom"],
        properties: {
          department: { type: "string" },
          symptom: { type: "string" },
        },
      },
    },
  },
} as const;

type LlmAuditPart = Omit<AuditReport, "cost_model"> & {
  pain_categories: PainCategory[];
};

async function runOpenAiAudit(args: {
  domain: string;
  url: string;
  scrape: { markdown: string; metadata: Record<string, unknown> } | null;
  enrichment: unknown;
}): Promise<LlmAuditPart> {
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
          content: `Generate the AI Readiness diagnostic for this company. Data:\n\n${JSON.stringify(
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
  return JSON.parse(content) as LlmAuditPart;
}

function renderEmailHtml(audit: AuditReport, website: string): string {
  const cm = audit.cost_model;
  const pain = audit.pain_categories
    .map(
      (p, i) => `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #eaeaea;">
          <div style="font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#64748b;font-weight:700;">${escapeHtml(p.department)}</div>
          <div style="font-size:15px;color:#0f172a;margin-top:4px;">${escapeHtml(p.symptom)}</div>
          <div style="font-size:13px;color:#475569;margin-top:6px;">~${formatNumber(cm.pain_hours_per_year[i] ?? 0)} hrs/yr trapped in this work</div>
        </td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0f172a;">
  <div style="max-width:640px;margin:0 auto;padding:32px 24px;">
    <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#0B1F3B;font-weight:700;">UpSkill USA · AI Readiness Diagnostic</div>
    <h1 style="font-size:28px;line-height:1.2;margin:8px 0 4px;">${escapeHtml(audit.company_name)}</h1>
    <div style="color:#475569;font-size:14px;">${escapeHtml(website)} · ${escapeHtml(audit.industry)} · ${escapeHtml(audit.size_estimate)}</div>

    <div style="margin:28px 0;padding:24px;border:1px solid #e2e8f0;border-radius:16px;background:#0B1F3B;color:#ffffff;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#F5C84C;font-weight:700;">Annual Cost of Inaction</div>
      <div style="font-size:48px;font-weight:800;color:#ffffff;line-height:1;margin-top:6px;">${formatUsdShort(cm.annual_value_at_risk)}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.75);margin-top:8px;">in labor value locked in repeatable work, every year</div>
      <div style="margin-top:16px;display:block;font-size:13px;color:rgba(255,255,255,0.85);">
        ${formatNumber(cm.employees)} employees · ${formatNumber(cm.addressable_roles)} addressable roles · ${formatNumber(cm.weekly_hours_reclaimable)} hrs/wk recoverable
      </div>
    </div>

    <div style="margin:0 0 28px;padding:20px;border:1px solid #fde68a;background:#fffbeb;border-radius:12px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#92400e;font-weight:700;">5-Year Competitive Gap</div>
      <div style="font-size:32px;font-weight:800;color:#0B1F3B;margin-top:4px;">${formatUsdShort(cm.five_year_cost_of_inaction)}</div>
      <div style="font-size:13px;color:#475569;margin-top:4px;">if competitors deploy AI before you do.</div>
    </div>

    <div style="margin:8px 0 6px;font-size:13px;color:#64748b;">Autonomous Workforce Score: <b style="color:#0B1F3B;">${Math.round(audit.autonomous_workforce_score)}/100</b></div>
    <p style="font-size:14px;line-height:1.6;color:#334155;margin:4px 0 0;">${escapeHtml(audit.score_rationale)}</p>

    <h2 style="font-size:18px;margin:28px 0 8px;">Executive Summary</h2>
    <p style="font-size:15px;line-height:1.6;color:#1f2937;">${escapeHtml(audit.executive_summary)}</p>

    <h2 style="font-size:18px;margin:28px 0 8px;">What's hiding in your operations</h2>
    <table style="width:100%;border-collapse:collapse;border:1px solid #eaeaea;border-radius:12px;overflow:hidden;">${pain}</table>

    <div style="margin:28px 0;padding:24px;border-radius:16px;background:linear-gradient(135deg,#0B1F3B,#1e3a5f);color:#ffffff;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.14em;color:#F5C84C;font-weight:700;">Your roadmap is ready</div>
      <div style="font-size:20px;font-weight:700;margin-top:6px;line-height:1.3;">Sign up to unlock your role-by-role automation map, 90-day pilot plan, and ROI projections by department.</div>
    </div>

    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #eaeaea;font-size:11px;color:#64748b;line-height:1.5;">
      Methodology: cost figures derived from your headcount × industry-standard fully-loaded labor cost (BLS 2023) × automatable-work share (McKinsey, 2023). 5-year figure compounded for competitive productivity gap.
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
  try {
    const baseUrl = process.env.LOVABLE_PUBLIC_URL ?? process.env.SUPABASE_URL ?? "";
    if (!baseUrl) return false;
    const html = renderEmailHtml(audit, website);
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/lovable/email/transactional/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: email,
        subject: `Your AI Readiness Diagnostic for ${audit.company_name}`,
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
    let leadId: string | null = null;
    const email = data.email.trim().toLowerCase();
    try {
      const { url, domain } = normalizeUrl(data.website);

      const insert = await supabase.rpc("create_pending_lead", {
        _website: domain,
        _email: email,
      });

      if (insert.error || !insert.data) {
        throw new Error(`Failed to create lead: ${insert.error?.message ?? "unknown error"}`);
      }
      leadId = insert.data as string;

      const [scrape, enrichment] = await Promise.all([scrapeCompany(url), enrichCompany(domain)]);

      const llmPart = await runOpenAiAudit({ domain, url, scrape, enrichment });
      const costModel = computeCostModel(
        enrichment as Parameters<typeof computeCostModel>[0],
        llmPart.pain_categories,
      );
      const audit: AuditReport = { ...llmPart, cost_model: costModel };

      const emailSent = await trySendAuditEmail(data.email, domain, audit);

      await supabase.rpc("finalize_lead", {
        _lead_id: leadId,
        _status: "completed",
        _audit: JSON.parse(JSON.stringify(audit)),
        _enrichment: JSON.parse(
          JSON.stringify({
            scrape_metadata: scrape?.metadata ?? null,
            companies_api: enrichment,
          }),
        ),
        _error: null as unknown as string,
      });

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
        await supabase.rpc("finalize_lead", {
          _lead_id: leadId,
          _status: "failed",
          _audit: null,
          _enrichment: null,
          _error: message,
        });
      }
      return { ok: false, error: message };
    }
  });
