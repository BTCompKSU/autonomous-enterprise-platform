import { createFileRoute } from "@tanstack/react-router";
import { AuditCTA } from "@/components/AuditCTA";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Product Demo — UpSkill USA" },
      {
        name: "description",
        content:
          "Watch the UpSkill USA demo: opportunity mapping, executive audit, employee analysis, and agent builder in action.",
      },
      { property: "og:title", content: "Product Demo — UpSkill USA" },
      {
        property: "og:description",
        content:
          "See how UpSkill USA helps enterprises deploy AI safely and reskill their workforce.",
      },
    ],
  }),
  component: DemoPage,
});

// Replace with the real video ID when available
const YOUTUBE_ID = "dQw4w9WgXcQ";

function DemoPage() {
  return (
    <main className="bg-background">
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
          Guided Demo
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          See UpSkill USA in action.
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A walkthrough of the four pillars: opportunity mapping, executive audit, employee
          analysis, and the agent builder.
        </p>

        <div className="mt-8 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube.com/embed/${YOUTUBE_ID}`}
              title="UpSkill USA Product Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <AuditCTA
        headline="Ready to see your own audit?"
        subline="Get a tailored AI deployment plan for your enterprise in minutes."
      />
    </main>
  );
}
