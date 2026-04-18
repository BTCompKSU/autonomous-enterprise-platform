

## Plan: WorkflowAI — Agent Builder demo route

This is a self-contained demo page added to the existing site. It lives at a new route and reuses the project's existing shadcn/Tailwind/Lucide/Recharts stack. No backend, no DB, no new deps.

### Route & integration
- New route: `src/routes/workflowai.tsx` (path `/workflowai`)
- Has its own `head()` metadata (title, description, og)
- Wrapped in its own dark `bg-slate-950` shell — does NOT render the global `AppHeader` (avoids the duplicate-nav issue we just fixed on other preview pages)
- Add nav link "WorkflowAI" to `src/components/AppShell.tsx` `marketingNav` so judges can find it
- Replace homepage "Agent Builder" preview CTA target from `/preview/agent-builder` to `/workflowai` (or add alongside — will confirm in implementation; safer to add alongside)

### Component structure (all in one route file, or split if it grows)
```
/workflowai
├── <WorkflowAIShell>            // dark theme wrapper, sidebar + header + main
│   ├── <Sidebar>                // logo, nav items, Maria avatar w/ AI score 7.6
│   ├── <TopBar>                 // breadcrumb, Simulated pill, Run/Export buttons, company tag
│   └── <Tabs>                   // 4 tabs OR stacked on mobile
│       ├── Panel 1: <WorkflowCanvas>     // SVG-based, 7 nodes + animated dashed arrows
│       ├── Panel 2: <RunSimulator>       // 3 invoice cards + total saved
│       ├── Panel 3: <OversightQueue>     // review queue + AI learning log + Maria stats
│       └── Panel 4: <ImpactDashboard>    // 4 KPIs + 2 Recharts + gradient banner
```

### Tech choices (avoiding new deps)
- **Workflow canvas**: custom SVG (no React Flow). 7 nodes positioned in a grid; SVG `<path>` connectors with `stroke-dasharray` + CSS `@keyframes` for the flowing-dots animation. Diamond shape via rotated div for Node 3. Simpler, zero deps, fits "hackathon demo" scope.
- **Charts**: Recharts (already in project — `chart.tsx` exists)
- **Animations**: Tailwind keyframes already configured (fade-in, scale-in) + simple `useState` driven sequencing for "Run Simulation". No framer-motion needed.
- **Tabs**: existing shadcn `tabs.tsx`
- **Slider**: existing shadcn `slider.tsx` (used in OversightPanel already)

### Local state model
```ts
const [threshold, setThreshold] = useState(0.90);
const [running, setRunning] = useState(false);
const [activeNode, setActiveNode] = useState<number | null>(null);  // for run animation
const [reviewedRun3, setReviewedRun3] = useState(false);            // toggles after Approve
const [feedbackLog, setFeedbackLog] = useState<string[]>([...]);    // grows on Approve
```

Derived: each invoice's status is recomputed from `threshold` so dragging the slider live-updates Panel 2 cards and Panel 4 KPIs (auto-approved %, hours saved). Hours saved counter ticks up by ~0.2hr when corrections approved.

### Hardcoded data
All numbers from the spec, kept in a `const DATA = {...}` block at the top of the route file for easy tweaking. Three invoice runs as an array.

### Brand tokens
Use Tailwind arbitrary values for the exact hexes (`bg-[#0F172A]`, `text-[#4F46E5]`, etc.) inside this route only — does NOT alter the global theme tokens (other pages stay on the existing brand). Inter is already the system default.

### Run Simulation animation sequence
1. Click button → `running=true`, progress bar (0→100% over ~2.5s)
2. `activeNode` cycles 1→2→3→(4 or 5)→5→6→7 with ~300ms each, glow ring on active node
3. Run cards fade-in staggered (existing `animate-fade-in`)
4. KPI numbers count up from 0 → final via `requestAnimationFrame` over ~800ms

### Files
**New**: `src/routes/workflowai.tsx`
**Edit**: `src/components/AppShell.tsx` (add nav link), `src/routes/index.tsx` (optional: link the homepage Agent Builder card to `/workflowai`)

No new deps, no migration, no server function, no auth — public route.

