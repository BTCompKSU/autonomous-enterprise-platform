import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { useOnboardingProfile } from "@/lib/onboarding-store";

export const Route = createFileRoute("/onboarding/step-4")({
  component: Step4,
});

const FACTS = [
  "43% of Finance tasks can be fully automated today",
  "Teams using AI augmentation recover 8+ hrs/week on average",
  "0 jobs need to be eliminated — humans + AI > AI alone",
];

function Step4() {
  const navigate = useNavigate();
  const { profile } = useOnboardingProfile();
  const [step, setStep] = useState(0);
  const [factIdx, setFactIdx] = useState(0);
  const [done, setDone] = useState(false);

  const taskCount = profile.selected_tasks.length + profile.custom_tasks.length;

  const items = [
    { label: `Role identified: ${profile.selected_role || "your role"}`, kind: "static" as const },
    { label: `Department mapped: ${profile.selected_department || "your team"}`, kind: "static" as const },
    { label: `Analyzing ${taskCount} tasks across Automate / Augment / Author buckets…`, kind: "dynamic" as const },
    { label: "Calculating your AI opportunity score…", kind: "dynamic" as const },
    { label: "Generating workflow recommendations…", kind: "dynamic" as const },
  ];

  // Reveal items every 600ms
  useEffect(() => {
    if (step >= items.length) {
      const t = setTimeout(() => setDone(true), 400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 600);
    return () => clearTimeout(t);
  }, [step, items.length]);

  // Rotate facts every 1.5s
  useEffect(() => {
    const t = setInterval(() => setFactIdx((i) => (i + 1) % FACTS.length), 1500);
    return () => clearInterval(t);
  }, []);

  // Auto-redirect 1.5s after done
  useEffect(() => {
    if (!done) return;
    const t = setTimeout(() => navigate({ to: "/workflowai" }), 1500);
    return () => clearTimeout(t);
  }, [done, navigate]);

  const ringPct = Math.min(100, (step / items.length) * 100);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      {/* Animated ring */}
      <div className="relative grid h-32 w-32 place-items-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            className="text-muted"
          />
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - ringPct / 100)}
            strokeLinecap="round"
            className="text-warning transition-all duration-500"
          />
        </svg>
        <div
          className={`grid h-16 w-16 place-items-center rounded-full bg-warning text-warning-foreground ${
            done ? "animate-scale-in" : "animate-pulse"
          }`}
        >
          {done ? <Check className="h-8 w-8" /> : <Sparkles className="h-7 w-7" />}
        </div>
      </div>

      <h2 className="mt-8 text-3xl font-extrabold tracking-tight sm:text-4xl">
        {done
          ? `Your profile is ready!`
          : "Building your AI opportunity profile…"}
      </h2>

      {/* Checklist */}
      <ul className="mt-6 w-full max-w-md space-y-2 text-left">
        {items.map((it, i) => {
          const visible = i < step || done;
          const completed = done || i < step - 1 || it.kind === "static";
          if (!visible) return null;
          return (
            <li
              key={it.label}
              className="flex items-start gap-3 rounded-lg border bg-card px-4 py-2.5 text-sm animate-fade-in"
            >
              {completed ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-warning" />
              )}
              <span className="text-foreground">{it.label}</span>
            </li>
          );
        })}
      </ul>

      {/* Rotating fact */}
      {!done && (
        <div
          key={factIdx}
          className="mt-8 max-w-md rounded-lg border-l-4 border-warning bg-card px-4 py-3 text-left text-sm italic text-foreground animate-fade-in"
        >
          {FACTS[factIdx]}
        </div>
      )}

      {/* CTA when done */}
      {done && (
        <Link
          to="/workflowai"
          className="mt-8 rounded-lg bg-warning px-8 py-4 text-base font-bold text-warning-foreground shadow-lg transition hover:bg-warning/90 animate-scale-in"
        >
          See My AI Opportunity →
        </Link>
      )}
    </div>
  );
}
