

## Plan: Pivot the audit from "deployment recommendations" to "cost-of-inaction" math

The current audit hands out the candy (specific opportunities, descriptions, next steps) before the user has signed up. The user wants it inverted: use the real headcount/industry data we already pull from TheCompaniesAPI to do **concrete dollar math** that creates urgency, then make the call-to-action the only way to see *how* to capture that value.

### The data we actually have (confirmed from DB)

From `enrichment.companies_api`:
- `about.totalEmployeesExact` (e.g. 6410) — the key input
- `about.totalEmployees` (bucket like "5k-10k") — fallback
- `about.industry` (e.g. "individual-and-family-services") — drives wage + automation rate
- `about.yearFounded`, `locations.headquarters.country/state`, `technologies.active`

We don't have revenue, but headcount × industry-avg fully-loaded labor cost × automatable-task % gives a defensible number.

### The math (server-side, deterministic — not LLM)

A new `computeCostModel()` function, runs alongside the LLM call:

```
employees           = totalEmployeesExact (or midpoint of bucket)
addressableRoles    = employees × roleAddressabilityFactor[industry]   // e.g. 0.55 for finance, 0.40 for healthcare
fullyLoadedCost     = avgSalaryByIndustry × 1.30                       // benefits+overhead
automatableHoursPct = automatableHoursByIndustry[industry]             // e.g. 0.22 = 22% of work week
weeklyHoursReclaimable = addressableRoles × 40 × automatableHoursPct
annualHoursReclaimable = weeklyHoursReclaimable × 50
annualValueAtRisk      = annualHoursReclaimable × (fullyLoadedCost / 2080)
fiveYearCostOfInaction = annualValueAtRisk × 5 × competitorCompoundFactor  // 1.15
```

Industry lookup tables (~12 industries + a default) live in `src/lib/cost-model.ts`. All numbers cited from public sources (BLS, McKinsey 2023 Generative AI report) in code comments so they're defensible.

### What the report shows now (fewer specifics, more urgency)

**KEEP (high-level, motivating):**
- Company name, industry, headcount badge — proves we did our homework
- Autonomous Workforce Score (the 0–100) — kept as the hook
- One-paragraph executive summary

**REPLACE the "Top Opportunities" / "Risks" / "Next Steps" sections with:**
1. **The Cost of Inaction** — hero number: `$X.XM annual labor value locked in repeatable work` with breakdown chips: `{employees} employees · {addressableRoles} addressable roles · {weeklyHours}h/wk recoverable`
2. **5-Year Competitive Gap** — `$Y.YM` if competitors deploy AI first (the compound figure)
3. **What's hiding in your operations** — 3–4 *teaser* categories, NOT solutions: e.g. "Finance ops: ~12,400 hrs/yr trapped in manual reconciliation" — names the wound, doesn't sell the bandage
4. **Locked CTA panel** — replaces "Next Steps". Big gradient card: *"Your deployment roadmap is ready. Sign up to unlock: role-by-role automation map, 90-day pilot plan, ROI projections by department."* with primary "Create your account" button → `/signup?from=audit&lead={leadId}`

### LLM prompt rewrite

Slim the OpenAI call down — it now only generates:
- `score` + `score_rationale` (qualitative)
- `executive_summary` (2 sentences, urgency-leaning)
- `pain_categories[]` — 3–4 short labels with *symptom only*, no solution (e.g. `{department: "Finance", symptom: "Manual invoice processing and 3-way matching"}`). Replaces `top_opportunities`.

Drop `risks`, `next_steps`, `top_opportunities` from the schema. Keep `AuditReport` type changes minimal-ish but breaking — update `audit-types.ts`, `audit.functions.ts` (schema + email HTML), and `AuditSplash.tsx` (report card).

### Files

**Edit:**
- `src/lib/audit-types.ts` — replace `top_opportunities/risks/next_steps` with `pain_categories`, add `cost_model` block
- `src/lib/cost-model.ts` *(new)* — industry tables + `computeCostModel(enrichment)` pure function
- `src/lib/audit.functions.ts` — slim LLM schema, call `computeCostModel`, merge into response, update email HTML
- `src/components/AuditSplash.tsx` — rebuild `AuditReportCard` around cost numbers + locked CTA

No DB migration (results land in existing `leads.audit` jsonb). No new deps.

### What this fixes

- **Less candy in the lobby:** no more free department-by-department playbook
- **Real math, not vibes:** numbers come from their actual headcount + industry benchmarks, not LLM guesses
- **Urgency over advice:** "$X.XM/yr at risk" + "competitors closing the gap" creates the motivation the user is asking for
- **CTA earns its keep:** the roadmap is the gated reward for signup, not a freebie above the fold

