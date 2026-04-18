

## Plan: Fix WorkflowAI canvas + complete Run Simulator and Oversight tabs

The current `/workflowai` page has all 4 tabs but Panel 1's canvas clips node_4, and Panels 2-3 need polish + animation wiring. Single-file route, additive fixes.

### Fix 1 — Workflow Canvas (Panel 1)

- **Wrap SVG in a scroll container** with `overflow-auto` + visible scrollbars; set inner SVG to a fixed `width={1100} height={720}` viewBox so panning works on small viewports.
- **Reposition node_4 (Maria Review)** to the LEFT of node_3's vertical axis (currently it sits right and gets clipped). New layout:
  ```
              [node_1]
                 │
              [node_2]
                 │
              [node_3 ◇]
              ╱        ╲
       [node_4]      (auto path)
              ╲        ╱
              [node_5]
                 │
              [node_6]
                 │
              [node_7]
  ```
- **Add "Fit to screen" button** (Maximize2 icon) top-right of canvas — toggles a `fit` state that swaps the wrapper from `overflow-auto` (pan mode) to `w-full h-auto` with `preserveAspectRatio="xMidYMid meet"` (fit mode).
- **Animated flow dot**: when `running` is true, render a `<circle r=6>` with `<animateMotion>` along each `<path>` in sequence. For invoice_003 the dot routes node_3 → node_4 → node_5; for 001/002 it routes node_3 → node_5 directly. Drive sequencing by stepping through `runIndex` state in the existing `runSimulation()`.
- **Node pulse**: bind `activeNode` (already in state) to a `ring-2 ring-[#F5C84C] animate-pulse` class on the node card.

### Fix 2 — Run Simulator Tab (Panel 2)

- **Confidence rings**: replace flat badges with SVG ring (stroke-dasharray based on confidence, emerald for ≥threshold, amber otherwise). ~80px diameter.
- **Path-taken row** under each card: small chip sequence (e.g., `Auto → Approval → ERP` or `Human Review → Correction → Approval → ERP`).
- **Card 3 extras**: corrections chips `[po_number] [amount]` + reviewer badge with UserRound icon "Maria Reyes".
- **Stagger entrance**: when `running` flips true, add `animate-fade-in` with inline `style={{ animationDelay: `${i*600}ms` }}`. Progress bar at panel top driven by existing `progress` state.
- **Summary bar** (bottom): "Total Time Recovered This Batch: 58 minutes" + sub-stat "Avg confidence: 88% · 2 of 3 auto-approved" — both derived from `runStatuses` so they react to threshold changes.

### Fix 3 — Human Oversight Tab (Panel 3)

- **Left column — Review Queue card** for invoice_003:
  - Header with AlertTriangle icon
  - Field diff display: original → corrected for `po_number` (PO-2024-8821 → PO-2024-8812) and `amount` ($12,400.00 → $12,450.00), shown as side-by-side amber/emerald chips
  - Approve/Reject buttons; Approve triggers `setReviewedRun3(true)` → card swaps to emerald with CheckCircle2 + "Reviewed & Approved", appends new entry to `feedbackLog`, and bumps the Panel 4 hours-saved counter by +0.2hr (already wired)
- **Right column — AI Learning Log**:
  - Pulsing Brain icon header
  - Terminal-styled log: `bg-slate-950 font-mono text-xs text-emerald-400` lines
  - Entries seeded from `feedbackLog` state; each new approval prepends a timestamped line
  - Subtext: "These corrections improve future extraction accuracy"
- **Bottom stats row** (Maria's workload): Invoices handled 24 · Auto-resolved 16 (67%) · Required review 8 (33%) · Focus time freed 8 hrs/wk — 4 small stat tiles.

### Files

**Edit only**: `src/routes/workflowai.tsx` — all changes are local to the existing route. No new components, no new deps, no routing changes.

