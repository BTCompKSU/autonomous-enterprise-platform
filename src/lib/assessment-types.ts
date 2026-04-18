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
  readiness_score: number; // 0-100
  readiness_band: "Emerging" | "Developing" | "Proficient" | "Advanced";
  summary: string;
  strengths: string[]; // 3-5
  gaps: string[]; // 3-5
  recommended_skills: SkillRecommendation[]; // 3-5
  recommended_agents: RecommendedAgent[]; // 2-3
  next_actions: string[]; // 3-5
}

export type SubmitAssessmentResponse =
  | { ok: true; assessment_id: string; analysis: AssessmentAnalysis }
  | { ok: false; error: string };
