import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle, PlayCircle, Sparkles } from "lucide-react";

type FAQItem = {
  q: string;
  a: string;
  bullets?: string[];
  example?: string;
};
type FAQSection = {
  id: string;
  title: string;
  subhead: string;
  items: FAQItem[];
};

const SECTIONS: FAQSection[] = [
  {
    id: "big-picture",
    title: "The Big Picture",
    subhead: "What UpSkill is and why it exists.",
    items: [
      {
        q: "Are you recommending companies eliminate jobs?",
        a: "No. UpSkill explicitly does the opposite. We identify where AI can handle repetitive work and help employees shift into higher-value roles, not remove them.",
      },
      {
        q: "Is this just a demo or a real product?",
        a: "This is a production-ready concept, built as a hackathon prototype. Some integrations are simulated, but the architecture is real and scalable.",
      },
      {
        q: "Why should we trust this approach?",
        a: "Because it doesn't just automate work — it provides:",
        bullets: [
          "Visibility into tasks",
          "Control via human-in-the-loop systems",
          "Measurable ROI",
          "A clear path for workforce transformation",
        ],
      },
    ],
  },
  {
    id: "framework",
    title: "How the Framework Works",
    subhead: "The vocabulary and scoring behind every recommendation.",
    items: [
      {
        q: 'What does "Automate / Augment / Own" actually mean?',
        a: "Three categories that classify every task in a workflow:",
        bullets: [
          "Automate → AI fully handles the task",
          "Augment → AI assists, human stays in control",
          "Own → Human-only work (judgment, relationships, leadership)",
        ],
      },
      {
        q: "How do you determine what goes into each category?",
        a: "We analyze task-level responsibilities, not just job titles, using:",
        bullets: [
          "Repetition",
          "Rule-based structure",
          "Data dependency",
          "Need for human judgment",
        ],
      },
      {
        q: 'What is the "AI Opportunity Score"?',
        a: "A measure of how much of a role or department's work can be:",
        bullets: ["Automated", "Augmented", "Optimized with AI"],
      },
      {
        q: 'What is the "Autonomous Workforce Score"?',
        a: "It reflects how much of a company's workflows can run end-to-end with minimal human intervention, while maintaining oversight.",
      },
    ],
  },
  {
    id: "methodology",
    title: "Methodology & Accuracy",
    subhead: "How estimates and audits are produced.",
    items: [
      {
        q: "How do you estimate time savings?",
        a: "We calculate current weekly hours per task, post-AI time (automation or assisted), then compute hours recovered per week.",
        example: "Maria recovers 17.8 hours/week from automation alone.",
      },
      {
        q: "Are these estimates exact?",
        a: "No — they are directionally accurate for decision-making. The goal is to identify high-impact opportunities quickly, not produce perfect forecasts.",
      },
      {
        q: "What data do you use to generate the audit?",
        a: "We combine:",
        bullets: [
          "Website data (via Firecrawl)",
          "Department headcount data",
          "Industry + firmographic data",
          "Labor statistics (BLS)",
        ],
      },
      {
        q: "How fast does this work?",
        a: "The system generates a full AI Opportunity Audit in ~30 seconds from a company URL.",
      },
    ],
  },
  {
    id: "trust",
    title: "Trust, Safety & Governance",
    subhead: "How we keep humans in control.",
    items: [
      {
        q: "How do you ensure AI doesn't make mistakes?",
        a: "We use:",
        bullets: [
          "Confidence scores (e.g., 98%, 94%, 72%)",
          "Automatic routing to human review below threshold",
          "Continuous learning from corrections",
        ],
      },
      {
        q: "How do you prevent bias or unfair outcomes?",
        a: "We design for:",
        bullets: [
          "Human oversight",
          "Transparent task-level logic",
          "Role-based governance controls",
        ],
      },
      {
        q: "Do employees resist this kind of system?",
        a: "Resistance drops when employees see time savings, career growth pathways, and clear boundaries of what AI does vs. what they own. Maria's story is the proof point.",
      },
    ],
  },
  {
    id: "roi",
    title: "ROI & Outcomes",
    subhead: "What companies and employees actually get.",
    items: [
      {
        q: "What happens to employees after automation?",
        a: "They are guided into structured upskilling pathways that transition them into AI-augmented roles.",
      },
      {
        q: "How quickly can companies see ROI?",
        a: "Early gains come from high-automation workflows like invoice processing. Typical impact: measurable within 30–90 days.",
      },
      {
        q: "What kind of ROI are we talking about?",
        a: "Example from the demo:",
        bullets: ["$6.7M annual value", "$42.5K platform cost", "157x ROI"],
      },
      {
        q: "How is this different from other AI tools?",
        a: "Most tools automate isolated tasks. UpSkill maps entire workflows, connects automation → workforce → ROI → training, and operates at company + employee level simultaneously.",
      },
    ],
  },
  {
    id: "fit",
    title: "Fit & Integration",
    subhead: "Where UpSkill plugs in.",
    items: [
      {
        q: "What industries does this apply to?",
        a: "Any organization with structured workflows:",
        bullets: [
          "Finance",
          "Operations",
          "Customer service",
          "HR",
          "Enterprise IT",
        ],
      },
      {
        q: "Can this integrate with our systems?",
        a: "Yes — future integrations include HRIS, ERP systems, and internal workflow tools. (Current demo uses simulated integrations.)",
      },
    ],
  },
];

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — UpSkill USA" },
      {
        name: "description",
        content:
          "Answers to the most common questions about UpSkill USA's AI Opportunity Audits, governance model, ROI methodology, and workforce transition approach.",
      },
      { property: "og:title", content: "FAQ — UpSkill USA" },
      {
        property: "og:description",
        content:
          "Plain-language answers for judges, executives, and skeptics: how the framework works, how we measure ROI, and how humans stay in control.",
      },
    ],
  }),
  component: FAQPage,
});

function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-card/50 to-background">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Answers for judges, executives, and skeptics — in plain language.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[220px,1fr]">
          {/* Sticky in-page nav (desktop) */}
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-1 text-sm">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Jump to
              </div>
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="space-y-10">
            {SECTIONS.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-20 rounded-2xl border bg-card p-6 shadow-sm sm:p-8"
              >
                <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {section.title}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {section.subhead}
                </p>
                <Accordion type="single" collapsible className="mt-5">
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} value={`${section.id}-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-medium sm:text-base">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                          <p>{item.a}</p>
                          {item.bullets && (
                            <ul className="ml-5 list-disc space-y-1">
                              {item.bullets.map((b, j) => (
                                <li key={j}>{b}</li>
                              ))}
                            </ul>
                          )}
                          {item.example && (
                            <div className="rounded-lg border border-brand/20 bg-brand/5 px-3 py-2 text-xs text-foreground">
                              <span className="font-semibold text-brand">
                                Example:
                              </span>{" "}
                              {item.example}
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ))}

            {/* Bottom CTA */}
            <div className="rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/10 to-card p-8 text-center shadow-sm">
              <h3 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Still have questions?
              </h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Run a live audit on your own company URL, or watch the 90-second
                demo to see the full workflow.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/opportunity"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-foreground transition-colors hover:bg-brand/90"
                >
                  <Sparkles className="h-4 w-4" />
                  Get my audit
                </Link>
                <Link
                  to="/demo"
                  className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent"
                >
                  <PlayCircle className="h-4 w-4" />
                  Watch demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
