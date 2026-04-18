
## The tension, restated

- **Oscar's WorkflowAI** (`/workflowai`): rich audit output — donut, task ownership, hours recovered, AI readiness. Diagnostic, executive-facing.
- **Rick's plug-and-play**: Maria opens something and it just *helps her today*. The Agent Builder preview (`/preview/agent-builder`) hints at this — Trigger → AI Emulator → Confidence Check → Human Review → Action.

These aren't opposed. They're two ends of one pipeline:

```text
  Oscar's view                              Rick's view
  ───────────                               ──────────
  Audit → Identify automatable tasks  →→→   Deploy emulator → Maria uses it
  (diagnostic, exec)                        (operational, employee)
```

The audit *finds* AUTOMATE tasks. The emulator *runs* them. One produces the recommendation; the other makes it real.

## The happy medium

A **"Deploy this"** bridge on every AUTOMATE task. Diagnostic stays Oscar's. Action becomes Rick's. Maria's experience: *"Your audit found 9.5 hrs/week of invoice entry is automatable → [Deploy AI Emulator] → it runs tomorrow, you review exceptions only."*

Three moves, smallest first:

1. **On `/workflowai`** — every AUTOMATE-bucket task row gets a "Deploy as Emulator →" button that deep-links into the agent-builder with a task slug.
2. **On `/preview/agent-builder`** — read the `?task=` param, render a contextual header: *"Generated from Maria's audit · Invoice data entry · 9.5 hrs/week recovered"*. The builder becomes the *output* of the audit, not a separate product.
3. **On Maria's employee view** — add "My Emulators": deployed agents working on her behalf, confidence scores, items waiting for her review. The daily plug-and-play surface Rick wants.

## What I'd build first

Just steps 1+2 — the linkage. ~1 hour. No new data model. Proves the bridge is real before investing in step 3.

### Implementation sketch

- Add a small `SAMPLE_TASKS` lookup (3–4 entries: invoice entry, PO matching, etc.) keyed by slug, each with `{ label, hoursPerWeek, trigger, confidenceThreshold }`.
- `/preview/agent-builder` reads `?task=invoice-entry` via search param, renders a provenance strip above the existing builder blocks. Falls back to current generic view when no param.
- `/workflowai` AUTOMATE rows render a `<Link to="/preview/agent-builder" search={{ task: slug }}>` button.

### What changes visually

```text
  /workflowai (AUTOMATE row)              /preview/agent-builder?task=invoice-entry
  ───────────────────────────             ───────────────────────────────────────
  Invoice data entry    9.5h → 0.4h       ┌─ Generated from Maria's audit ──────┐
  [Deploy as Emulator →] ─────────────▶   │ Invoice data entry · 9.5h/wk saved  │
                                          └──────────────────────────────────────┘
                                          [Trigger] → [AI Emulator] → ...
```

Step 3 (Maria's "My Emulators" inbox) is the bigger follow-up — worth its own conversation about whether it's mocked or wired to real audit data.

## Two questions before I build

1. **Scope** — just the linkage (steps 1+2), or linkage + Maria's emulator inbox (1+2+3)?
2. **Lens** — should the bridge optimize CTAs for the executive ("Deploy this recommendation, recover 9.5 hrs/wk") or for Maria ("Hand this off to AI, keep the judgment work")?

Pick a combo and I'll implement.
