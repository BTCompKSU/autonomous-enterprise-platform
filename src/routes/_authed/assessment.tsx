import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  AlertTriangle,
  Bot,
  RefreshCw,
} from "lucide-react";
import { AppHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { submitAssessment } from "@/lib/assessment.functions";
import type {
  Answers,
  AnswerValue,
  AssessmentAnalysis,
  Question,
} from "@/lib/assessment-types";
import { toast } from "sonner";

export const Route = createFileRoute("/_authed/assessment")({
  component: AssessmentPage,
});

const QUESTIONS: Question[] = [
  {
    id: "role",
    type: "short_text",
    section: "About you",
    prompt: "What is your current role?",
    help: "Be specific — e.g. 'Senior Account Manager, Mid-Market'.",
    placeholder: "e.g. Operations Lead at a 50-person logistics company",
    maxLength: 200,
  },
  {
    id: "department",
    type: "single_choice",
    section: "About you",
    prompt: "Which department best describes your work?",
    options: [
      { value: "operations", label: "Operations" },
      { value: "sales", label: "Sales / Revenue" },
      { value: "marketing", label: "Marketing" },
      { value: "support", label: "Customer Support" },
      { value: "finance", label: "Finance / Accounting" },
      { value: "hr", label: "People / HR" },
      { value: "engineering", label: "Engineering / Product" },
      { value: "other", label: "Other" },
    ],
  },
  {
    id: "ai_comfort",
    type: "scale",
    section: "Current AI fluency",
    prompt: "How comfortable are you using AI tools in your day-to-day work?",
    min: 1,
    max: 5,
    minLabel: "Never used",
    maxLabel: "Daily power user",
  },
  {
    id: "tools_used",
    type: "multi_choice",
    section: "Current AI fluency",
    prompt: "Which AI tools have you used meaningfully in the last 90 days?",
    help: "Pick all that apply.",
    options: [
      { value: "chatgpt", label: "ChatGPT / Claude / Gemini chat" },
      { value: "copilot", label: "GitHub Copilot or coding assistants" },
      { value: "notion_ai", label: "Notion AI / Docs AI" },
      { value: "image_gen", label: "Image generation (Midjourney, DALL-E)" },
      { value: "automation", label: "Workflow automation (Zapier, n8n, Make)" },
      { value: "voice", label: "Voice / transcription AI" },
      { value: "none", label: "None yet" },
    ],
  },
  {
    id: "repetitive_tasks",
    type: "short_text",
    section: "Your workflows",
    prompt: "What's the most repetitive task you do every week?",
    help: "Describe it like you'd describe it to a teammate. The more specific, the better the recommendations.",
    placeholder: "e.g. Pulling weekly performance numbers from 4 dashboards into a slide deck for Monday's exec sync.",
    maxLength: 500,
  },
  {
    id: "hours_repetitive",
    type: "scale",
    section: "Your workflows",
    prompt: "Roughly how many hours per week do you spend on repetitive, rules-based work?",
    min: 1,
    max: 5,
    minLabel: "< 2 hrs",
    maxLabel: "20+ hrs",
  },
  {
    id: "blockers",
    type: "multi_choice",
    section: "Your workflows",
    prompt: "What stops you from using more AI today?",
    options: [
      { value: "trust", label: "I don't trust the output enough" },
      { value: "data", label: "Sensitive data — can't paste it in" },
      { value: "skill", label: "I don't know which tool to use" },
      { value: "time", label: "No time to learn" },
      { value: "policy", label: "Company policy / approval" },
      { value: "none", label: "Nothing — I just need better tools" },
    ],
  },
  {
    id: "goal",
    type: "short_text",
    section: "Goals",
    prompt: "If an AI agent could take one thing off your plate this quarter, what would it be?",
    placeholder: "e.g. Drafting first-pass responses to inbound RFPs.",
    maxLength: 500,
  },
  {
    id: "ambition",
    type: "scale",
    section: "Goals",
    prompt: "How ambitious do you want to be with AI this year?",
    min: 1,
    max: 5,
    minLabel: "Cautious",
    maxLabel: "Aggressive",
  },
];

const SECTIONS = Array.from(new Set(QUESTIONS.map((q) => q.section)));

type Step = "intake" | "submitting" | "result";

function isAnswered(q: Question, val: AnswerValue | undefined): boolean {
  if (val === undefined || val === null) return false;
  if (q.type === "short_text") return typeof val === "string" && val.trim().length > 0;
  if (q.type === "single_choice") return typeof val === "string" && val.length > 0;
  if (q.type === "multi_choice") return Array.isArray(val) && val.length > 0;
  if (q.type === "scale") return typeof val === "number";
  return false;
}

function AssessmentPage() {
  const [step, setStep] = useState<Step>("intake");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [analysis, setAnalysis] = useState<AssessmentAnalysis | null>(null);

  const total = QUESTIONS.length;
  const q = QUESTIONS[index];
  const progress = useMemo(() => Math.round(((index + 1) / total) * 100), [index, total]);
  const currentSectionIdx = SECTIONS.indexOf(q.section);

  const setAnswer = (id: string, v: AnswerValue) =>
    setAnswers((prev) => ({ ...prev, [id]: v }));

  const next = () => {
    if (!isAnswered(q, answers[q.id])) {
      toast.error("Please answer this question to continue.");
      return;
    }
    if (index < total - 1) setIndex(index + 1);
  };

  const back = () => {
    if (index > 0) setIndex(index - 1);
  };

  const submit = async () => {
    if (!isAnswered(q, answers[q.id])) {
      toast.error("Please answer this question to continue.");
      return;
    }
    setStep("submitting");
    try {
      const res = await submitAssessment({ data: { answers } });
      if (!res.ok) {
        toast.error(res.error);
        setStep("intake");
        return;
      }
      setAnalysis(res.analysis);
      setStep("result");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Submission failed";
      toast.error(msg);
      setStep("intake");
    }
  };

  const retake = () => {
    setAnswers({});
    setAnalysis(null);
    setIndex(0);
    setStep("intake");
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-6 py-10">
        {step === "intake" && (
          <IntakeView
            q={q}
            value={answers[q.id]}
            onChange={(v) => setAnswer(q.id, v)}
            index={index}
            total={total}
            progress={progress}
            sectionIndex={currentSectionIdx}
            onBack={back}
            onNext={next}
            onSubmit={submit}
          />
        )}

        {step === "submitting" && <SubmittingView />}

        {step === "result" && analysis && (
          <ResultView analysis={analysis} onRetake={retake} />
        )}
      </main>
    </div>
  );
}

function IntakeView({
  q,
  value,
  onChange,
  index,
  total,
  progress,
  sectionIndex,
  onBack,
  onNext,
  onSubmit,
}: {
  q: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
  index: number;
  total: number;
  progress: number;
  sectionIndex: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const isLast = index === total - 1;
  return (
    <>
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-semibold uppercase tracking-[0.18em] text-brand">
            Skill Assessment
          </span>
          <span className="text-muted-foreground">
            Question {index + 1} of {total}
          </span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {SECTIONS.map((s, i) => (
            <Badge
              key={s}
              variant={i === sectionIndex ? "default" : "outline"}
              className={cn(
                "text-[10px] uppercase tracking-wider",
                i < sectionIndex && "opacity-50",
              )}
            >
              {s}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="p-6 md:p-8">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {q.section}
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{q.prompt}</h2>
        {q.help && <p className="mt-2 text-sm text-muted-foreground">{q.help}</p>}

        <div className="mt-6">
          <QuestionInput q={q} value={value} onChange={onChange} />
        </div>

        <div className="mt-8 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} disabled={index === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          {isLast ? (
            <Button onClick={onSubmit} className="bg-brand hover:bg-brand/90 text-brand-foreground">
              <Sparkles className="mr-2 h-4 w-4" /> Generate analysis
            </Button>
          ) : (
            <Button onClick={onNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </>
  );
}

function QuestionInput({
  q,
  value,
  onChange,
}: {
  q: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue) => void;
}) {
  if (q.type === "short_text") {
    const v = (value as string | undefined) ?? "";
    const max = q.maxLength ?? 500;
    return (
      <div>
        <Textarea
          value={v}
          onChange={(e) => onChange(e.target.value.slice(0, max))}
          placeholder={q.placeholder}
          rows={5}
          className="resize-none"
        />
        <div className="mt-1 text-right text-[11px] text-muted-foreground">
          {v.length} / {max}
        </div>
      </div>
    );
  }

  if (q.type === "single_choice") {
    const v = (value as string | undefined) ?? "";
    return (
      <div className="grid gap-2">
        {q.options.map((o) => {
          const selected = v === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                selected
                  ? "border-brand bg-brand/5 text-foreground"
                  : "border-border hover:border-brand/50 hover:bg-accent/40",
              )}
            >
              <span>{o.label}</span>
              {selected && <CheckCircle2 className="h-4 w-4 text-brand" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (q.type === "multi_choice") {
    const v = (value as string[] | undefined) ?? [];
    const toggle = (val: string) => {
      if (val === "none") {
        onChange(v.includes("none") ? [] : ["none"]);
        return;
      }
      const without = v.filter((x) => x !== "none");
      const exists = without.includes(val);
      onChange(exists ? without.filter((x) => x !== val) : [...without, val]);
    };
    return (
      <div className="grid gap-2">
        {q.options.map((o) => {
          const selected = v.includes(o.value);
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => toggle(o.value)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition-colors",
                selected
                  ? "border-brand bg-brand/5 text-foreground"
                  : "border-border hover:border-brand/50 hover:bg-accent/40",
              )}
            >
              <span>{o.label}</span>
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded border",
                  selected ? "border-brand bg-brand text-brand-foreground" : "border-muted-foreground/40",
                )}
              >
                {selected && <CheckCircle2 className="h-3.5 w-3.5" />}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // scale
  const v = (value as number | undefined) ?? Math.round((q.min + q.max) / 2);
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{q.minLabel}</span>
        <span>{q.maxLabel}</span>
      </div>
      <Slider
        value={[v]}
        min={q.min}
        max={q.max}
        step={1}
        onValueChange={(vals) => onChange(vals[0])}
      />
      <div className="mt-3 text-center text-3xl font-semibold tabular-nums">{v}</div>
    </div>
  );
}

function SubmittingView() {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">Analyzing your assessment</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Our AI is reviewing your answers and generating a personalized readiness analysis. This
        usually takes 10–30 seconds.
      </p>
    </Card>
  );
}

function ResultView({
  analysis,
  onRetake,
}: {
  analysis: AssessmentAnalysis;
  onRetake: () => void;
}) {
  const score = Math.round(analysis.readiness_score);
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
        <Sparkles className="h-3.5 w-3.5" />
        Your AI Readiness Analysis
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col items-start gap-6 p-6 md:flex-row md:items-center md:p-8">
          <div className="flex flex-col items-center">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Readiness
            </div>
            <div className="mt-1 text-6xl font-extrabold tabular-nums text-brand">{score}</div>
            <Badge variant="outline" className="mt-2">
              {analysis.readiness_band}
            </Badge>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Summary</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <TrendingUp className="h-4 w-4 text-success" /> Strengths
          </div>
          <ul className="space-y-2 text-sm">
            {analysis.strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <AlertTriangle className="h-4 w-4 text-warning" /> Gaps
          </div>
          <ul className="space-y-2 text-sm">
            {analysis.gaps.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 text-brand" /> Recommended skills to build
        </div>
        <div className="grid gap-3">
          {analysis.recommended_skills.map((s, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 rounded-lg border bg-accent/20 p-4"
            >
              <div>
                <div className="font-medium">{s.skill}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.rationale}</div>
              </div>
              <Badge
                variant="outline"
                className={cn(
                  s.priority === "High" && "border-destructive/50 text-destructive",
                  s.priority === "Medium" && "border-warning/50 text-warning-foreground",
                )}
              >
                {s.priority}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-brand" /> Suggested agents to deploy
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {analysis.recommended_agents.map((a, i) => (
            <div key={i} className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{a.name}</div>
                <Badge variant="secondary" className="text-[10px]">
                  ~{a.estimated_hours_saved_per_week} hrs/wk
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{a.purpose}</p>
              <p className="mt-2 text-[11px] italic text-muted-foreground">Why now: {a.why_now}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-3 text-sm font-semibold">Your next actions</div>
        <ol className="space-y-2 text-sm">
          {analysis.next_actions.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onRetake}>
          <RefreshCw className="mr-2 h-4 w-4" /> Retake assessment
        </Button>
        <Button asChild className="bg-brand hover:bg-brand/90 text-brand-foreground">
          <Link to="/skill-module">Open Agent Builder</Link>
        </Button>
      </div>
    </div>
  );
}
