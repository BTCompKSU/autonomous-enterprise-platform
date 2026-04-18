import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cog,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
  UserCheck,
  Wrench,
} from "lucide-react";
import { AppHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { submitAssessment } from "@/lib/assessment.functions";
import type {
  Answers,
  AnswerValue,
  Question,
  RoleAnalysis,
  RoleTask,
  TaskBucket,
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
  const [analysis, setAnalysis] = useState<RoleAnalysis | null>(null);

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
      <main className="mx-auto max-w-5xl px-6 py-10">
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
    <div className="mx-auto max-w-3xl">
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
    </div>
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
    <Card className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-4 p-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-brand/10 text-brand">
        <Loader2 className="h-7 w-7 animate-spin" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">Analyzing your role</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        Generating your task list and classifying each one as Automate, Augment, or Own. This usually
        takes 15–40 seconds.
      </p>
    </Card>
  );
}

// ===== Result view =====

const BUCKET_META: Record<
  TaskBucket,
  { label: string; tagline: string; icon: typeof Cog; tone: string; chip: string; dot: string }
> = {
  AUTOMATE: {
    label: "Automate",
    tagline: "AI fully handles these tasks — no human needed in the loop.",
    icon: Cog,
    tone: "border-success/40 bg-success/5",
    chip: "bg-success/10 text-success border-success/30",
    dot: "bg-success",
  },
  AUGMENT: {
    label: "Augment",
    tagline: "AI assists; you stay in control of judgment and final output.",
    icon: Sparkles,
    tone: "border-brand/40 bg-brand/5",
    chip: "bg-brand/10 text-brand border-brand/30",
    dot: "bg-brand",
  },
  OWN: {
    label: "Own",
    tagline: "Human-led work. AI may help with prep — you drive the outcome.",
    icon: UserCheck,
    tone: "border-primary/40 bg-primary/5",
    chip: "bg-primary/10 text-primary border-primary/30",
    dot: "bg-primary",
  },
};

function fmtNum(n: number, digits = 0): string {
  return n.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function ResultView({
  analysis,
  onRetake,
}: {
  analysis: RoleAnalysis;
  onRetake: () => void;
}) {
  const { summary, tasks, role, department, total_tasks_analyzed } = analysis;

  const grouped = useMemo(() => {
    const buckets: Record<TaskBucket, RoleTask[]> = { AUTOMATE: [], AUGMENT: [], OWN: [] };
    for (const t of tasks) buckets[t.bucket].push(t);
    // sort each bucket by hours saved desc
    for (const k of Object.keys(buckets) as TaskBucket[]) {
      buckets[k].sort((a, b) => b.monthly_hours_saved - a.monthly_hours_saved);
    }
    return buckets;
  }, [tasks]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
        <Sparkles className="h-3.5 w-3.5" />
        Role Analysis · Automate / Augment / Own
      </div>

      {/* Header */}
      <Card className="p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Role analyzed
            </div>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{role}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {department && <span className="capitalize">{department}</span>}
              {department && " · "}
              <span>{total_tasks_analyzed} tasks analyzed</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={BUCKET_META.AUTOMATE.chip}>
              {summary.automate_count} Automate
            </Badge>
            <Badge variant="outline" className={BUCKET_META.AUGMENT.chip}>
              {summary.augment_count} Augment
            </Badge>
            <Badge variant="outline" className={BUCKET_META.OWN.chip}>
              {summary.own_count} Own
            </Badge>
          </div>
        </div>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          icon={Clock}
          label="Monthly hours saved"
          value={fmtNum(summary.estimated_monthly_hours_saved)}
          sub="Across all tasks, estimated"
        />
        <KpiCard
          icon={TrendingUp}
          label="FTE-equivalent saved"
          value={fmtNum(summary.estimated_fte_equivalent_saved, 2)}
          sub="At 160 hrs / month"
        />
        <KpiCard
          icon={Cog}
          label="Bucket mix"
          value={`${summary.automate_count} · ${summary.augment_count} · ${summary.own_count}`}
          sub="Automate · Augment · Own"
        />
      </div>

      {/* Bucket sections */}
      {(["AUTOMATE", "AUGMENT", "OWN"] as TaskBucket[]).map((bucket) => {
        const items = grouped[bucket];
        if (items.length === 0) return null;
        const meta = BUCKET_META[bucket];
        const Icon = meta.icon;
        const totalHours = items.reduce((sum, t) => sum + t.monthly_hours_saved, 0);
        return (
          <section key={bucket} className="space-y-3">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn("inline-block h-2 w-2 rounded-full", meta.dot)} />
                  <h2 className="text-lg font-semibold tracking-tight">
                    {meta.label}{" "}
                    <span className="text-muted-foreground font-normal">· {items.length}</span>
                  </h2>
                </div>
                <p className="text-xs text-muted-foreground">{meta.tagline}</p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div className="tabular-nums text-base font-semibold text-foreground">
                  {fmtNum(totalHours)} hrs/mo
                </div>
                <div>saved in this bucket</div>
              </div>
            </div>

            <Card className={cn("divide-y border", meta.tone)}>
              {items.map((task) => (
                <TaskRow key={task.task_id} task={task} bucket={bucket} />
              ))}
            </Card>
          </section>
        );
      })}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
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

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-2 text-3xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}

function TaskRow({ task, bucket }: { task: RoleTask; bucket: TaskBucket }) {
  const [open, setOpen] = useState(false);
  const meta = BUCKET_META[bucket];
  const confColor =
    task.confidence === "HIGH"
      ? "border-success/40 text-success"
      : task.confidence === "MEDIUM"
        ? "border-warning/40 text-warning-foreground"
        : "border-muted-foreground/30 text-muted-foreground";

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="flex w-full items-start gap-4 p-4 text-left transition-colors hover:bg-background/40"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="truncate font-medium">{task.task_name}</div>
              <Badge variant="outline" className={cn("shrink-0 text-[10px]", confColor)}>
                {task.confidence}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="capitalize">{task.frequency}</span>
              <span>·</span>
              <span>
                {task.avg_minutes_per_instance} min × {task.instances_per_month}/mo
              </span>
              <span>·</span>
              <span>{task.automation_rate_pct}% automation rate</span>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <div className="text-base font-semibold tabular-nums">
                {fmtNum(task.monthly_hours_saved, 1)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">hrs/mo</span>
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">saved</div>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform",
                open && "rotate-180",
              )}
            />
          </div>
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="space-y-3 px-4 pb-4 pt-1 text-sm">
          <p className="text-muted-foreground">{task.description}</p>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Why this bucket
              </div>
              <p>{task.rationale}</p>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <meta.icon className="h-3 w-3" /> AI action
              </div>
              <p>{task.ai_action}</p>
            </div>
          </div>
          {task.tools_suggested.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Wrench className="h-3 w-3" /> Suggested tools
              </div>
              <div className="flex flex-wrap gap-1.5">
                {task.tools_suggested.map((t, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
