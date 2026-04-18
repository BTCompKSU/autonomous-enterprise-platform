export type QuestionType = "single_choice" | "multi_choice" | "scale" | "short_text";

export type Question =
  | {
      id: string;
      type: "single_choice";
      section: string;
      prompt: string;
      help?: string;
      options: { value: string; label: string }[];
    }
  | {
      id: string;
      type: "multi_choice";
      section: string;
      prompt: string;
      help?: string;
      options: { value: string; label: string }[];
      maxSelections?: number;
    }
  | {
      id: string;
      type: "scale";
      section: string;
      prompt: string;
      help?: string;
      min: number;
      max: number;
      minLabel: string;
      maxLabel: string;
    }
  | {
      id: string;
      type: "short_text";
      section: string;
      prompt: string;
      help?: string;
      placeholder?: string;
      maxLength?: number;
    };

export type AnswerValue = string | string[] | number;
export type Answers = Record<string, AnswerValue>;

// ===== Legacy readiness analysis (kept for backwards compatibility) =====

export interface RecommendedAgent {
  name: string;
  purpose: string;
  why_now: string;
  estimated_hours_saved_per_week: number;
}

export interface SkillRecommendation {
  skill: string;
  rationale: string;
  priority: "High" | "Medium" | "Low";
}

export interface AssessmentAnalysis {
  readiness_score: number;
  readiness_band: "Emerging" | "Developing" | "Proficient" | "Advanced";
  summary: string;
  strengths: string[];
  gaps: string[];
  recommended_skills: SkillRecommendation[];
  recommended_agents: RecommendedAgent[];
  next_actions: string[];
}

// ===== Role-based AUTOMATE / AUGMENT / OWN analysis (current) =====

export type TaskBucket = "AUTOMATE" | "AUGMENT" | "OWN";
export type TaskConfidence = "HIGH" | "MEDIUM" | "LOW";
export type TaskFrequency = "daily" | "weekly" | "monthly" | "ad-hoc";

export interface RoleTask {
  task_id: number;
  task_name: string;
  description: string;
  frequency: TaskFrequency;
  avg_minutes_per_instance: number;
  instances_per_month: number;
  bucket: TaskBucket;
  rationale: string;
  ai_action: string;
  automation_rate_pct: number;
  monthly_hours_saved: number;
  confidence: TaskConfidence;
  tools_suggested: string[];
}

export interface RoleAnalysisSummary {
  automate_count: number;
  augment_count: number;
  own_count: number;
  estimated_monthly_hours_saved: number;
  estimated_fte_equivalent_saved: number;
}

export interface RoleAnalysis {
  role: string;
  department: string;
  total_tasks_analyzed: number;
  summary: RoleAnalysisSummary;
  tasks: RoleTask[];
}

export type SubmitAssessmentResponse =
  | { ok: true; assessment_id: string; analysis: RoleAnalysis }
  | { ok: false; error: string };
