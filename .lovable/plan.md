

User wants an FAQ section. Need to figure out: where to put it (homepage? new route?) and how to render it (accordion is the obvious choice given existing shadcn `accordion.tsx`).

Looking at the content: 20 questions grouped into clear themes (concept, methodology, accuracy, ROI, governance, scope). This is judge/enterprise objection content — fits the homepage marketing surface, not behind auth.

Best approach: new public route `/faq` with grouped accordion sections, plus a link from the homepage and the AppHeader's public nav. Per TanStack Start guidance, separate route (not hash anchors) — gets its own SSR, title, OG tags, and is shareable (judges can be sent the link directly).

## Plan: Public FAQ page

### Route
`src/routes/faq.tsx` → `/faq` (public, unauthed)

Has its own `head()` with title "FAQ — UpSkill USA", description tuned for judges/enterprise objections, og:title/description.

### Structure
Group the 20 Qs into 6 themed sections, each rendered as a card with a shadcn `Accordion` (single-expand per section, all collapsed by default):

1. **The Big Picture** — Q1, Q10, Q20
2. **How the Framework Works** — Q2, Q3, Q16, Q17
3. **Methodology & Accuracy** — Q4, Q5, Q7, Q8
4. **Trust, Safety & Governance** — Q6, Q15, Q18
5. **ROI & Outcomes** — Q11, Q12, Q13, Q9
6. **Fit & Integration** — Q14, Q19

Each section has a heading + short subhead, then the accordion. Trigger shows the question, content shows the answer with proper formatting (bullet lists rendered as `<ul>`, examples called out in a subtle muted box).

### Page layout
- `AppHeader` at top
- Hero strip: "Frequently Asked Questions" + one-line subhead ("Answers for judges, executives, and skeptics — in plain language.")
- Sticky in-page nav (anchor links to the 6 section IDs) on desktop only
- 6 sections stacked
- Bottom CTA card: "Still have questions?" → links to `/opportunity` (Get Audit) and `/demo` (Watch Demo)

### Data
FAQ content lives in a typed array at the top of the route file:
```ts
type FAQItem = { q: string; a: string; bullets?: string[]; example?: string };
type FAQSection = { id: string; title: string; subhead: string; items: FAQItem[] };
const SECTIONS: FAQSection[] = [...]
```

Keeps content easy to edit without component churn.

### Wiring
- `src/components/AppShell.tsx`: add "FAQ" to the public nav (next to existing public links)
- `src/routes/index.tsx`: add a "Have questions? See the FAQ →" link in an existing section (or as a small strip near the bottom) so judges can discover it from the homepage

### Files
**New**: `src/routes/faq.tsx`
**Edit**: `src/components/AppShell.tsx` (nav), `src/routes/index.tsx` (homepage link)

No DB, no server function, no migration — pure content page.

