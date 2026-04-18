// Deterministic cost-of-inaction model.
//
// Sources (all public, defensible):
// - U.S. Bureau of Labor Statistics, Occupational Employment & Wages, May 2023
//   (mean annual wages by industry sector). https://www.bls.gov/oes/
// - McKinsey, "The economic potential of generative AI" (June 2023) — sector-level
//   automation potential of work activities (table A2). 22%–34% of work hours
//   automatable across knowledge-worker industries.
// - Fully-loaded cost multiplier 1.30x = MIT Sloan / SHRM standard for benefits
//   + employer taxes + overhead allocation.
// - 50 working weeks/year, 2080 hours/year (40 hrs × 52 - 2wk PTO).
// - 5-year competitor compound factor 1.15 = compounded productivity gap if
//   competitors deploy AI first while you don't (conservative).

import type { CostModel, PainCategory } from "./audit-types";

type IndustryProfile = {
  label: string;
  /** Avg annual wage (BLS mean, knowledge-worker roles) */
  avgWage: number;
  /** Share of headcount whose work is meaningfully addressable by AI agents today */
  addressabilityFactor: number;
  /** Share of those roles' hours that AI can realistically take over (McKinsey) */
  automatableHoursPct: number;
};

// Keys are normalized lowercase substrings matched against TheCompaniesAPI
// `about.industry` slug (e.g. "individual-and-family-services", "software", "banking").
const INDUSTRY_TABLE: Array<[RegExp, IndustryProfile]> = [
  [/bank|financ|insur|capital|invest/, { label: "Financial services", avgWage: 95_000, addressabilityFactor: 0.55, automatableHoursPct: 0.30 }],
  [/legal|law/, { label: "Legal services", avgWage: 105_000, addressabilityFactor: 0.50, automatableHoursPct: 0.27 }],
  [/software|saas|internet|technolog|computer/, { label: "Software & technology", avgWage: 115_000, addressabilityFactor: 0.50, automatableHoursPct: 0.28 }],
  [/health|hospital|medical|pharma|biotech/, { label: "Healthcare", avgWage: 78_000, addressabilityFactor: 0.40, automatableHoursPct: 0.22 }],
  [/retail|ecommerce|consumer/, { label: "Retail & consumer", avgWage: 58_000, addressabilityFactor: 0.45, automatableHoursPct: 0.25 }],
  [/manufactur|industrial|automotive/, { label: "Manufacturing", avgWage: 68_000, addressabilityFactor: 0.35, automatableHoursPct: 0.24 }],
  [/logistic|transport|supply|shipping/, { label: "Logistics & transportation", avgWage: 62_000, addressabilityFactor: 0.40, automatableHoursPct: 0.26 }],
  [/educat|school|university|e-learning/, { label: "Education", avgWage: 64_000, addressabilityFactor: 0.40, automatableHoursPct: 0.22 }],
  [/media|publish|marketing|advertis/, { label: "Media & marketing", avgWage: 82_000, addressabilityFactor: 0.55, automatableHoursPct: 0.32 }],
  [/govern|public|nonprofit|family-services|social/, { label: "Public sector & social services", avgWage: 66_000, addressabilityFactor: 0.45, automatableHoursPct: 0.24 }],
  [/real.?estate|property/, { label: "Real estate", avgWage: 72_000, addressabilityFactor: 0.45, automatableHoursPct: 0.26 }],
  [/consult|profession.*service/, { label: "Professional services", avgWage: 92_000, addressabilityFactor: 0.55, automatableHoursPct: 0.30 }],
  [/energy|utilit|oil|gas/, { label: "Energy & utilities", avgWage: 88_000, addressabilityFactor: 0.35, automatableHoursPct: 0.22 }],
  [/hospitality|restaurant|hotel|travel/, { label: "Hospitality & travel", avgWage: 52_000, addressabilityFactor: 0.40, automatableHoursPct: 0.24 }],
];

const DEFAULT_PROFILE: IndustryProfile = {
  label: "Cross-industry",
  avgWage: 78_000,
  addressabilityFactor: 0.45,
  automatableHoursPct: 0.25,
};

const FULLY_LOADED_MULTIPLIER = 1.30;
const HOURS_PER_FTE_YEAR = 2080;
const WORKING_WEEKS = 50;
const FIVE_YEAR_COMPOUND = 1.15;

function midpointForBucket(bucket: string | undefined): number | null {
  if (!bucket) return null;
  // common TheCompaniesAPI buckets: "1-10", "11-50", "51-200", "201-500",
  // "501-1k", "1k-5k", "5k-10k", "10k-50k", "50k-100k", "100k+"
  const map: Record<string, number> = {
    "1-10": 5,
    "11-50": 30,
    "51-200": 125,
    "201-500": 350,
    "501-1k": 750,
    "1k-5k": 3000,
    "5k-10k": 7500,
    "10k-50k": 30000,
    "50k-100k": 75000,
    "100k+": 150000,
  };
  return map[bucket] ?? null;
}

function pickIndustry(slug: string | undefined): IndustryProfile {
  if (!slug) return DEFAULT_PROFILE;
  const s = slug.toLowerCase();
  for (const [rx, profile] of INDUSTRY_TABLE) {
    if (rx.test(s)) return profile;
  }
  return DEFAULT_PROFILE;
}

type EnrichmentLike = {
  about?: {
    totalEmployeesExact?: number | null;
    totalEmployees?: string | null;
    industry?: string | null;
    industries?: string[] | null;
  } | null;
} | null | undefined;

export function computeCostModel(
  enrichment: EnrichmentLike,
  painCategories: PainCategory[],
): CostModel {
  const exact = enrichment?.about?.totalEmployeesExact ?? null;
  const bucket = enrichment?.about?.totalEmployees ?? null;
  const slug =
    enrichment?.about?.industry ??
    enrichment?.about?.industries?.[0] ??
    null;

  let employees: number;
  let source: CostModel["employee_source"];
  if (typeof exact === "number" && exact > 0) {
    employees = Math.round(exact);
    source = "exact";
  } else {
    const mid = midpointForBucket(bucket ?? undefined);
    if (mid) {
      employees = mid;
      source = "bucket-midpoint";
    } else {
      employees = 250; // sensible default for unknown
      source = "default";
    }
  }

  const profile = pickIndustry(slug ?? undefined);
  const addressableRoles = Math.round(employees * profile.addressabilityFactor);
  const weeklyHoursReclaimable = Math.round(addressableRoles * 40 * profile.automatableHoursPct);
  const annualHoursReclaimable = weeklyHoursReclaimable * WORKING_WEEKS;
  const fullyLoadedCost = Math.round(profile.avgWage * FULLY_LOADED_MULTIPLIER);
  const hourlyRate = fullyLoadedCost / HOURS_PER_FTE_YEAR;
  const annualValueAtRisk = Math.round(annualHoursReclaimable * hourlyRate);
  const fiveYearCostOfInaction = Math.round(annualValueAtRisk * 5 * FIVE_YEAR_COMPOUND);

  // Distribute the annual hours across pain categories using a soft weighting
  // (first category gets the largest share, tapering down) — gives a credible
  // teaser figure per category without inventing solutions.
  const weights = painCategories.length > 0
    ? painCategories.map((_, i) => 1 / (i + 1.6))
    : [];
  const wSum = weights.reduce((a, b) => a + b, 0) || 1;
  const painHours = weights.map((w) =>
    Math.round((annualHoursReclaimable * w) / wSum / 100) * 100, // round to nearest 100
  );

  return {
    employees,
    employee_source: source,
    industry_label: profile.label,
    addressable_roles: addressableRoles,
    weekly_hours_reclaimable: weeklyHoursReclaimable,
    annual_hours_reclaimable: annualHoursReclaimable,
    fully_loaded_cost_per_role: fullyLoadedCost,
    annual_value_at_risk: annualValueAtRisk,
    five_year_cost_of_inaction: fiveYearCostOfInaction,
    pain_hours_per_year: painHours,
  };
}

export function formatUsdShort(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}
