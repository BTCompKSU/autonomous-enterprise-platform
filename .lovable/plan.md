
The loading phase currently animates steps in one-by-one (each appears with `if (!visible) return null`), causing the card to grow in height as steps mount. User wants all 4 steps visible from the start so the box stays a fixed size — only the icon swaps from spinner → checkmark as each step "completes."

## Change

In `src/routes/onboarding.step-3.tsx` `LoadingPhase`:

- Remove the `if (!visible) return null` early return so all 4 list items render immediately.
- Drop the `animate-fade-in` class on the items (no longer needed — they're all there from frame 1).
- Keep the existing `step` timer logic; it now only controls which row shows the spinner vs. the green check.
- Rows ahead of the current step get a muted/pending look (lower opacity + spinner) so the progression is still visible.

State logic per row index `i`:
- `i < step` → completed (emerald check, full opacity)
- `i === step` → in progress (spinning loader, full opacity)
- `i > step` → pending (spinning loader, opacity-50)

No other files touched. Box height stays constant from first paint.
