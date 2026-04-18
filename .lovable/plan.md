

## Plan: Print + Download for the on-screen audit, plus email parity verification

### Email parity — verified ✅
Both the on-screen report (`AuditReportCard` in `AuditSplash.tsx`) and the email (`renderEmailHtml` in `audit.functions.ts`) render from the **same `AuditReport` object** returned by `generateAudit`. Every number (`annual_value_at_risk`, `five_year_cost_of_inaction`, `weekly_hours_reclaimable`, per-pain-category `pain_hours_per_year[i]`, score) and every text field (`company_name`, `industry`, `size_estimate`, `executive_summary`, `score_rationale`, each pain `department` + `symptom`) appears in both. Differences are visual-only:
- Email omits the `WorkforceScoreScale` SVG (renders the score as a single line)
- Email shows the 3 stats inline as one line instead of 3 cards
- Otherwise: identical sections, identical order, identical methodology footer, identical locked-CTA copy

No data drift exists. I'll add a small comment in `audit.functions.ts` flagging this contract so future edits keep parity.

### Print / download

Add a **Print / Save as PDF** button to the report card. Browser-native printing is the best fit here — zero new dependencies, works on every device, and "Save as PDF" is built into every modern browser's print dialog. No server round-trip, no PDF library bloat.

**Changes to `src/components/AuditSplash.tsx`:**

1. Add a `Printer` icon button in the report header (next to "Run another"), label "Print / Save PDF", calls `window.print()`.
2. Add an `id="audit-printable"` on the report card root so we can scope print CSS to it.
3. Inject a scoped `<style media="print">` block inside `AuditReportCard` that:
   - Hides everything outside `#audit-printable` (`body > *:not(...) { display: none }` via a `print:hidden` strategy on the splash chrome — chip, headline, subhead, trust badges, loading/email forms — using a `data-print="hide"` attribute or just Tailwind's `print:hidden` utility on those wrappers).
   - Forces the report card to full width, removes shadows/rounded corners, and switches the dark navy hero sections to print-safe versions (keep navy bg with `print-color-adjust: exact` so the gold accent and dark hero survive the print).
   - Hides the "Run another" button and the Print button itself during print.
   - Sets `@page { margin: 0.5in; size: letter; }`.

4. Layout tweaks for print:
   - The hero "Cost of Inaction" navy block needs `-webkit-print-color-adjust: exact; print-color-adjust: exact;` to retain the navy + gold; otherwise browsers strip backgrounds.
   - Avoid page-break inside each pain-category card (`break-inside: avoid`).

**No new files, no new dependencies, no server changes.** All print logic is contained in `AuditSplash.tsx`.

### Non-goals
- Not generating a server-side PDF (would need a Worker-incompatible library like puppeteer/sharp — see runtime constraints).
- Not changing the email template (it already matches).

