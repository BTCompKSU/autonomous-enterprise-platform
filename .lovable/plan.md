

## Plan

Sweep all "Get my free audit" CTAs and point them to `/`.

### Audit
<lov-tool-use id="toolu_vrtx_01HZ8aPvJCPr5u73rAy4myGy" name="code--search_files" integration-id="code" data="{\"query\": \"Get my free audit\", \"include_patterns\": \"*.tsx\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01BpXpczBbfgAAp7PtbB8TqB" name="code--search_files" integration-id="code" data="{\"query\": \"Get my free audit|Get Your Free Audit\", \"include_patterns\": \"*.tsx\"}">
</lov-tool-use>
<lov-plan>

## Plan: Point all "Get my free audit" CTAs to the homepage

The bottom CTA component (`BottomCTA` in `src/routes/preview.executive-audit.tsx`, line ~373) currently links to `/opportunity`. This component is the shared bottom CTA used across preview pages. I'll switch its `Link to` from `/opportunity` to `/`.

### Changes

1. **`src/routes/preview.executive-audit.tsx`** — In the exported `BottomCTA` function, change `<Link to="/opportunity">` to `<Link to="/">`.

That's the only edit needed. The top banner CTA on the same file already points to `/` (fixed in the previous turn), and the homepage's own "Get my free audit" anchor (`src/routes/index.tsx`) is an in-page scroll, not a route link, so it stays as-is.

`AuditCTA.tsx` already links to `/` — no change needed.

