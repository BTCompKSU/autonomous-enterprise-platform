// Shared lookup that bridges the audit (workflowai) → emulator builder.
// Each entry corresponds to an AUTOMATE-bucket task surfaced in the audit
// and pre-fills the Agent Builder when deep-linked via ?task=<slug>.

export type SampleTaskSlug =
  | "invoice-entry"
  | "three-way-match"
  | "vendor-check"
  | "approval-routing";

export type SampleTask = {
  slug: SampleTaskSlug;
  label: string;
  workflow: string;
  hoursPerWeek: number; // hours Maria recovers / week
  trigger: string;
  confidenceThreshold: number;
  reviewer: string;
  // Maria's framing (employee lens) and Oscar's framing (executive lens)
  mariaPitch: string;
  execPitch: string;
};

export const SAMPLE_TASKS: Record<SampleTaskSlug, SampleTask> = {
  "invoice-entry": {
    slug: "invoice-entry",
    label: "Invoice data entry",
    workflow: "Accounts Payable",
    hoursPerWeek: 9.5,
    trigger: "New invoice received in inbox",
    confidenceThreshold: 90,
    reviewer: "Maria (AP Specialist)",
    mariaPitch:
      "Hand off the typing. You review the exceptions and keep the judgment work.",
    execPitch:
      "Recover 9.5 hrs/week per AP specialist. Redirect to vendor relationships and audit support.",
  },
  "three-way-match": {
    slug: "three-way-match",
    label: "3-way invoice matching",
    workflow: "Accounts Payable",
    hoursPerWeek: 6.2,
    trigger: "Invoice + PO + receipt available",
    confidenceThreshold: 92,
    reviewer: "Maria (AP Specialist)",
    mariaPitch:
      "AI cross-checks the three documents. You only see the ones that don't line up.",
    execPitch:
      "Cut match cycle from 18 min to 2 min per invoice. Catch discrepancies earlier in the cycle.",
  },
  "vendor-check": {
    slug: "vendor-check",
    label: "Vendor validation",
    workflow: "Accounts Payable",
    hoursPerWeek: 4.1,
    trigger: "New vendor or vendor data change",
    confidenceThreshold: 88,
    reviewer: "Maria (AP Specialist)",
    mariaPitch:
      "Duplicate vendors, missing W-9s, suspicious bank changes — all flagged before they hit you.",
    execPitch:
      "Reduce vendor-fraud risk and onboarding errors with deterministic checks before payment.",
  },
  "approval-routing": {
    slug: "approval-routing",
    label: "Approval routing",
    workflow: "Accounts Payable",
    hoursPerWeek: 3.4,
    trigger: "Invoice cleared validation",
    confidenceThreshold: 85,
    reviewer: "Maria (AP Specialist)",
    mariaPitch:
      "Routes to the right approver based on amount and cost center. You don't chase signatures.",
    execPitch:
      "Compress approval SLA from 3 days to 6 hours. Eliminate routing mistakes and re-work.",
  },
};

export const SAMPLE_TASK_LIST: SampleTask[] = Object.values(SAMPLE_TASKS);
