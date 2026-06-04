## Goal

Transform the homepage into a single long-scroll page with four anchored sections — Opportunity, Executive Audit, Employee Analysis, Emulator Builder — instead of routing visitors to four separate pages.

## Approach

Keep all existing section content intact (no visual redesign). Extract the page bodies from the four current routes into reusable section components, then compose them on the home route with anchor IDs and a sticky in-page nav.

## Sections (in order)

1. Hero + WhyNow strip (existing `AuditSplash` + `WhyNowStrip`) — unchanged
2. `#opportunity` — Opportunity Map (from `src/routes/opportunity.tsx`)
3. `#executives` — Executive Audit preview (from `src/routes/preview.executive-audit.tsx`)
4. `#employees` — Employee Analysis preview (from `src/routes/preview.employee-analysis.tsx`)
5. `#emulators` — Emulator Builder preview (from `src/routes/preview.agent-builder.tsx`)
6. Pillars + final CTA — unchanged

## In-page navigation

- Sticky sub-nav bar appears under the header once the user scrolls past the hero, with four anchor links: Opportunity · Executives · Employees · Emulators.
- `scroll-margin-top` on each section so anchors don't hide under the sticky header.
- Smooth scroll via CSS (`scroll-behavior: smooth` on `html`).
- Each section gets a subtle eyebrow + divider for visual rhythm; the redundant per-page "PreviewBanner" hero is dropped in favor of section headers.

## Section CTAs

Each section keeps its bottom CTA but now links to `/opportunity` audit form (anchor `#audit` on the hero) instead of cross-linking to sibling preview pages.

## Files to change

| File | Change |
|---|---|
| `src/components/sections/OpportunitySection.tsx` | New — body of opportunity.tsx as a section (no `<main>` wrapper, no page-level padding hero) |
| `src/components/sections/ExecutiveAuditSection.tsx` | New — body of preview.executive-audit.tsx |
| `src/components/sections/EmployeeAnalysisSection.tsx` | New — body of preview.employee-analysis.tsx |
| `src/components/sections/EmulatorBuilderSection.tsx` | New — body of preview.agent-builder.tsx |
| `src/components/HomeSectionNav.tsx` | New — sticky anchor nav |
| `src/routes/index.tsx` | Compose: Hero → WhyNow → sticky nav → 4 sections → Pillars → CTA. Update preview cards to `<a href="#…">` anchors. |
| `src/routes/opportunity.tsx` | Replace with redirect to `/#opportunity` (keeps old links working) |
| `src/routes/preview.executive-audit.tsx` | Redirect to `/#executives` |
| `src/routes/preview.employee-analysis.tsx` | Redirect to `/#employees` |
| `src/routes/preview.agent-builder.tsx` | Redirect to `/#emulators` |
| `src/styles.css` | Add `html { scroll-behavior: smooth }` and `.section-anchor { scroll-margin-top: 80px }` |
| `src/components/AppShell.tsx` / nav | Update any header links pointing to those four routes to use `/#anchor` |

## SEO note

Consolidating four routes into one removes three indexable pages. Since these were preview/marketing variants of the same audit story, this is acceptable. Old URLs redirect so external links don't break. The home route's `head()` gets an expanded description covering all four sections.

## Out of scope

- No visual redesign of section internals
- No changes to the audit flow, server functions, or auth
- No changes to `/onboarding`, `/demo`, `/faq`, `/_authed/*`
