import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your AI profile — UpSkill USA" },
      {
        name: "description",
        content:
          "A 4-step onboarding that maps your role to AI opportunities — automate the rote, augment the nuanced, author the new.",
      },
    ],
  }),
  component: OnboardingLayout,
});

const STEPS = [
  { path: "/onboarding/step-1", label: "Department" },
  { path: "/onboarding/step-2", label: "Tasks" },
  { path: "/onboarding/step-3", label: "Analyze" },
];

function OnboardingLayout() {
  const { pathname } = useLocation();
  const currentIdx = Math.max(
    0,
    STEPS.findIndex((s) => pathname.startsWith(s.path)),
  );
  const activeStep = currentIdx === -1 ? 0 : currentIdx;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            to="/onboarding/step-1"
            className="group flex items-center gap-2 text-sm font-bold tracking-tight"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-brand-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              UpSkill <span className="text-brand">USA</span>
            </span>
          </Link>

          <Link
            to="/workflowai"
            className="text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            Skip for now →
          </Link>
        </div>

        {/* Progress bar */}
        <div className="mx-auto max-w-5xl px-6 pb-4">
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const filled = i <= activeStep;
              return (
                <div
                  key={s.path}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                    filled ? "bg-warning" : "bg-muted"
                  }`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em]">
            <span className="text-warning">
              Step {String(activeStep + 1).padStart(2, "0")} /{" "}
              {STEPS[activeStep]?.label ?? ""}
            </span>
            <span className="text-muted-foreground">
              {activeStep + 1} of {STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
