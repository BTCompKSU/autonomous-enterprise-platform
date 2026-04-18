
## UpSkill USA — Hackathon Judging Alignment Update

I'll layer the judging-criteria enhancements onto the existing 5-screen flow without breaking it. Everything uses mock data and stays inside the current TanStack Start + Tailwind setup.

### Global narrative reframe
- Update hero/landing copy to **"The Reliable Autonomous Workforce Platform"** with tagline **"From AI Pilots to Reliable Autonomous Operations"**
- Apply microcopy swaps everywhere: "Automation savings" → **"Productivity unlocked"**, "FTE reduction" → **"Capacity gained"**

### New cross-cutting components (reused across screens)
1. **AI Confidence & Oversight Panel** — confidence score badges on every automated task, global Reliability Threshold (90% default slider), auto-routing logic ("72% → Routed to Maria", "98% → Auto-approved"), oversight stats (% auto-approved, % human-reviewed, 1.8% error rate, "Improving with feedback" indicator)
2. **Autonomous Workflow Score** — radial gauge component (Finance 68%, Customer Service 62%) with "Above 60% = Autonomous Enterprise" callout
3. **Workforce Impact Summary** — Jobs displaced: 0, Roles transformed: +34, Promotions: +12, Hours redirected: 8,400/mo, plus "Bias & fairness check: Passed" badge
4. **Guided Demo Mode toggle** — global header switch that activates tooltip overlays highlighting key judge-relevant sections

### Screen-by-screen additions

**Screen 1 — Landing Page**
- New hero positioning + tagline
- "Why AI Automation Is Failing Today" 3-point strip → "UpSkill USA fixes all three"
- Autonomous Workflow Score preview gauge
- Final CTAs: **"See Your Autonomous Workforce Score"** and **"Run Enterprise AI Readiness Audit"**
- Subtle "System Architecture (Simulated)" footer panel

**Screen 2 — Opportunity Map** (existing)
- Inject Autonomous Workflow Score per department
- Microcopy updates

**Screen 3 — Skill Module / Agent Builder**
- Rename Deploy section → **"AI Agent Deployment Builder"**
- Visual flow blocks: Trigger → AI Agent → Confidence Check → Human Review → System Action
- "Production-Ready Agent Flow (Simulated)" label
- Confidence scores on each task

**Screen 4 — Employee Report**
- Add confidence-routing examples
- Embed Workforce Impact Summary
- Augmentation-over-replacement statement

**Screen 5 — Executive Dashboard**
- Autonomous Workflow Score as headline metric
- AI Oversight Panel
- Workforce Impact Summary
- **Regional Impact Projection** (Miami: 12K impacted, 2.4K new AI roles, $180M uplift, "Adaptable to national strategies" note)

### Technical approach
- Build reusable components in `src/components/judging/` (ConfidenceBadge, OversightPanel, WorkflowScoreGauge, WorkforceImpactCard, DemoModeProvider, RegionalImpactCard, WhyNowStrip, ArchitectureFooter)
- Demo Mode = React context + conditional tooltip overlay using existing shadcn Tooltip
- Radial gauge built with SVG (no new deps)
- All 5 existing routes preserved; only content/sections added
- Tailwind tokens reused; no design system changes

### Out of scope
- No real AI/backend wiring (all mock data per spec)
- No new routes — enhancements layer into existing 5 screens
