// Shared types between client and server for the AI audit flow.

export type AuditRecommendation = {
  title: string;
  department: string;
  description: string;
  impact: "High" | "Medium" | "Low";
  effort: "Low" | "Medium" | "High";
  estimated_hours_saved_per_week: number;
};

export type AuditReport = {
  company_name: string;
  industry: string;
  size_estimate: string;
  autonomous_workforce_score: number; // 0–100
  score_rationale: string;
  executive_summary: string;
  top_opportunities: AuditRecommendation[];
  risks: string[];
  next_steps: string[];
};

export type GenerateAuditResponse =
  | {
      ok: true;
      lead_id: string;
      website: string;
      email: string;
      audit: AuditReport;
      email_sent: boolean;
    }
  | {
      ok: false;
      error: string;
    };
