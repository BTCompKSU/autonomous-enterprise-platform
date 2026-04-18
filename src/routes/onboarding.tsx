import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Build your AI profile — UpSkill USA" },
      {
        name: "description",
        content:
          "A 3-step onboarding that maps your role to AI opportunities — automate the rote, augment the nuanced, author the new.",
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
    <div className="relative isolate min-h-screen overflow-hidden bg-[#0B1F3B] text-white">
      {/* Glow + grid overlays — match AuditSplash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 55% at 50% -10%, rgba(255,255,255,0.08), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 110%, rgba(245,200,76,0.10), transparent 65%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 30%, black, transparent 80%)",
        }}
      />

      {/* Header */}
      <header className="relative z-30 border-b border-white/10 bg-[#0B1F3B]/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link
            to="/onboarding/step-1"
            className="group flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#F5C84C] text-[#0B1F3B]">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              UpSkill <span className="text-[#F5C84C]">USA</span>
            </span>
          </Link>

          <Link
            to="/workflowai"
            className="text-xs font-medium text-white/60 transition hover:text-white"
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
                    filled ? "bg-[#F5C84C]" : "bg-white/15"
                  }`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.22em]">
            <span className="text-[#F5C84C]">
              Step {String(activeStep + 1).padStart(2, "0")} /{" "}
              {STEPS[activeStep]?.label ?? ""}
            </span>
            <span className="text-white/50">
              {activeStep + 1} of {STEPS.length}
            </span>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <Outlet />
      </main>
    </div>
  );
}
