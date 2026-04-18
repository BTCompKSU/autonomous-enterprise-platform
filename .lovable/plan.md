
## Rebrand `/workflowai` → Emulation Station

**Positioning shift:** From "developer IDE for AI workflows" to "Maria's workbench where she trains an off-the-shelf skill with her own knowledge." Same data, friendlier surface, expert mode hidden by default.

### 1. Naming & chrome
- Rename product to **Emulation Station** everywhere on this page (page title, sidebar logo, top breadcrumb, footer, export filename).
- Sidebar nav relabeled for an employee mindset: **My Skills** (was My Workflows), **Skill Library** (new — implied off-the-shelf catalog), **Training History** (was Run History), **My Team**, **Settings**. Keep Maria's profile card.
- Hero/breadcrumb becomes: *Skill Library › Invoice Generation › Maria's version* with a "Customized by Maria" pill instead of "Simulated."

### 2. New default tab — "My Skill" (employee-first)
A friendly landing tab that replaces Workflow Canvas as the default. Built from existing data, no new logic:
- **Skill card header**: "Invoice Generation" + 1-line plain-English description ("AI helps me draft and send invoices. I review anything it's unsure about.") + a big confidence dial (current threshold).
- **My Knowledge** panel — the headline new concept. Editable chip-list of Maria's "proprietary blend":
  - Vendor preferences (NET-30 default, prefers PDF)
  - Approval rules (>$10k → CFO)
  - Common exceptions (Acme always missing PO)
  - Tone & template (her invoice template)
  - "Add knowledge" button (chip input, stored in component state for the demo).
- **How it helps me today**: re-uses the 3 simulation runs as 3 simple "today's invoices" cards — friendlier copy, same mechanics, same Run Simulation button.
- **Comfort slider** (rebrand of the threshold slider): "How much should AI handle on its own?" with labels *Ask me more / Balanced / Trust it*. Same `threshold` state — no logic change.

### 3. Expert mode toggle (preserves the flow builder)
Top-right toggle: **Simple ↔ Expert**.
- **Simple (default)**: only the "My Skill" tab visible. Run Simulation button stays in the top bar.
- **Expert (toggled on)**: reveals the existing 4 tabs (Workflow Canvas, Run Simulator, Human Oversight, Impact) exactly as they are today. Zero behavioral changes — just hidden by default.
- Toggle state is local; shows a small "Expert mode" badge when on.

### 4. Copy pass (employee-friendly)
- "Confidence Check" → "Double-check threshold"
- "Auto-Approved / Human Review" stays (it's already clear)
- "Learning Feedback" → "What I taught it this week"
- Footer: "Powered by AI · Emulation Station" + tagline "Your skills, amplified."

### 5. Cross-page references
Update outbound link labels (no route change — `/workflowai` URL stays to keep routing simple):
- `onboarding.step-3.tsx`: button "Enter WorkflowAI" → "Open Emulation Station"
- `onboarding.tsx` and `onboarding.step-1.tsx`: "skip to workflowai" link label → "Skip to Emulation Station"
- `preview.agent-builder.tsx`: "Back to audit" link unchanged target, label stays.
- `sample-tasks.ts` comment refresh.
- Page meta: title "Emulation Station — Customize Your Skill", updated description.

### Files touched
- `src/routes/workflowai.tsx` — main rebrand: chrome, new "My Skill" tab as default, Simple/Expert toggle wrapping existing tabs, copy pass.
- `src/routes/onboarding.step-3.tsx`, `onboarding.step-1.tsx`, `onboarding.tsx` — link label updates only.
- `src/lib/sample-tasks.ts` — header comment.

### Out of scope (ask if you want any)
- Persisting Maria's custom knowledge to the database (currently demo-only state).
- Adding a true Skill Library catalog page with multiple off-the-shelf skills.
- Renaming the URL `/workflowai` → `/emulation-station` (would require a redirect for in-flight users).
