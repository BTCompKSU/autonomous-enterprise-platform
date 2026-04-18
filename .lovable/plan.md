

## Plan — Donut chart fixes + unified color system on Impact tab

All edits are scoped to `src/routes/workflowai.tsx` (the `ImpactDashboard` and `KpiCard` components, lines ~1063–1253). Data, layout, and animations stay untouched.

### Color system (applied consistently)
- Blue `#3B82F6` → AUTOMATE
- Yellow `#F59E0B` → AUGMENT
- Green `#10B981` → AUTHOR (value/growth)

### 1. Donut chart — colors, labels, leader lines
- Update `ownership` array colors: Automate `#3B82F6`, Augment `#F59E0B`, Author `#10B981`.
- Replace the inline `<Pie>` with a custom-rendered version using Recharts' `label` prop with a custom render function that draws external labels + leader lines (standard Recharts pattern using `midAngle`, `cx/cy`, `outerRadius`).
  - Each external label: bucket name uppercase 13px bold white + percentage 22px extra-bold in segment color, stacked.
  - Leader line: `<polyline>` from segment edge → elbow → label, white at 50% opacity, 1px.
- Make the ring fatter: `innerRadius={66}` `outerRadius={102}` (≈55% / 85% of the 240px chart area, accounting for label space — chart height bumped to 280px to fit external labels).
- Add hover glow: wrap each `<Cell>` and use Recharts `onMouseEnter` to set active index, then apply `filter: drop-shadow(0 0 8px <color>)` to the active cell via inline style.
- Center label: change "Maria's" → `MARIA'S` 11px uppercase tracking-widest slate-400; "Role Mix" → 16px bold white.

### 2. Legend cards below donut
- Keep 3-column grid, restyle each card:
  - 16×16 rounded-sm color square (was 8×8 dot).
  - Bold white 15px name (`Automate` / `Augment` / `Author`).
  - Percentage in matching color, bold.
  - Description in slate-400 12px (text already correct).
  - 3px left border in segment color, slate-700 background, rounded-lg, p-3.

### 3. KPI cards
- HOURS SAVED: `tone="#10B981"` ✓ keep.
- AUTO-APPROVED RATE: change `tone` to `#3B82F6`; update `autoDonut` to `[{ Auto: "#3B82F6" }, { Review: "#F59E0B" }]`; render the "33% routed to human review" sub line in yellow by adding a `subTone` prop to `KpiCard` (or wrapping that string in a colored span).
- ERROR RATE: `tone="#10B981"` ✓ keep.
- JOBS DISPLACED: change `tone` from `#A855F7` → `#F59E0B`. Keep purple gradient background (`warm` styling stays).

Add an optional `subTone?: string` prop to `KpiCard` so the auto-approved sub line can render in yellow.

### 4. Bar chart
- Before bar: `fill="#64748B"` ✓ keep.
- After bar: change `fill` from `#4F46E5` → `#3B82F6`.
- Add `<LabelList dataKey="before" position="top" />` and same for "after" with white bold 11px styling.
- Add Y-axis label "Minutes" via `<YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft", fill: "#94a3b8", fontSize: 11 }} />`.
- Legend already pulls colors from bars automatically.

### 5. $2.1M banner
- Keep indigo→purple gradient.
- Bump `$2.1M` to `text-[56px] font-extrabold leading-none text-white`.
- Add a `h-1 w-20 rounded-full bg-[#10B981] mt-2` accent under the dollar amount.
- Label: `text-[12px] uppercase tracking-wider text-white/70`.

### Note on "Own" rename
All user-visible labels on the Impact panel already say "Author" (verified). The only remaining `own` is the internal data key `DATA.ownership.own` (line 78) which is never rendered. I'll leave it untouched to avoid touching unrelated DATA shape — let me know if you want the data key renamed too.

### Files touched
- `src/routes/workflowai.tsx` (only)

