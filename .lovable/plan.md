

## Plan: Apply landing-page theme to onboarding

Re-skin the onboarding shell + all 3 steps to match the AuditSplash hero language: deep navy `#0B1F3B` background, gold `#F5C84C` accents, white floating cards with deep shadows, gold uppercase eyebrow chips, and tight-tracked semibold headings.

### Theme tokens (used inline, matching landing page)

- Background: `#0B1F3B` (deep navy) with radial-glow + grid overlays
- Accent: `#F5C84C` (gold) for chips, progress, active state, primary CTA highlights
- Card surface: white, `rounded-2xl`, `shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]`, `border-white/10`
- Headings: `font-semibold tracking-[-0.015em]` (not `font-extrabold`)
- Primary button: `bg-[#0B1F3B] text-white` (on white cards) or `bg-[#F5C84C] text-[#0B1F3B]` (on navy)

### File changes

1. **`src/routes/onboarding.tsx`** (shell)
   - Wrap whole page in navy bg with the same radial-glow + grid overlays from `AuditSplash`
   - Header: transparent over navy, white text, gold logo chip (`bg-[#F5C84C] text-[#0B1F3B]`), white "Skip" link with hover
   - Progress bar: filled segments use `#F5C84C`, empty use `white/15`; step label in gold uppercase tracked

2. **`src/routes/onboarding.step-1.tsx`** (Department picker)
   - Heading in white, semibold + tight tracking
   - Subhead in `white/70`
   - Department cards: white surface with shadow; **active** state = gold ring + gold check badge; icons in navy (or gold when active)
   - Continue button: gold bg, navy text when enabled; disabled = `white/10`

3. **`src/routes/onboarding.step-2.tsx`** (Tasks/skills)
   - Same heading + subhead treatment
   - Skill chips/checkboxes: white card surface, gold border + gold fill on selected; "AI-suggested" pre-selected items keep gold styling
   - Back/Continue: ghost-on-navy + gold primary

4. **`src/routes/onboarding.step-3.tsx`** (Analyze + report)
   - Loading phase: white card on navy, navy spinner, gold step pips (matches AuditSplash loading state exactly)
   - Result phase: white report card with shadow; KPI tiles use navy headers with gold accent numbers; bucket pills (`Automate/Augment/Own`) get a 3-color system anchored around navy/gold/emerald; "Enter WorkflowAI" CTA = gold pill button

### Notes

- All color values are inline literals matching the landing page (`#0B1F3B`, `#F5C84C`) — same approach the landing page uses, no new CSS variables introduced. This keeps the rest of the app (dashboard, admin, etc.) on the existing light theme.
- No font swap needed; the landing page uses the same default font stack but with `font-semibold` + tight tracking instead of `font-extrabold`. I'll align onboarding to match.
- Animations (`animate-fade-in`, `animate-scale-in`) preserved.

