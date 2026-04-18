
Step 3 ranking + rename "Own" → "Author".

## Changes to `src/routes/onboarding.step-3.tsx`

**1. Stack-rank the bucket tiles by count (descending)**
Currently the 3 tiles render in fixed order: Automate, Augment, Own. Replace with a sorted array so the highest-count bucket appears first, then second, then third.

```ts
const buckets = [
  { key: "AUTOMATE", label: "Automate", count: summary.automate_count, tone: "navy" },
  { key: "AUGMENT",  label: "Augment",  count: summary.augment_count,  tone: "gold" },
  { key: "OWN",      label: "Author",   count: summary.own_count,      tone: "emerald" },
].sort((a, b) => b.count - a.count);
```

Render `buckets.map(...)` into the existing 3-column grid. Ties keep declaration order (Automate > Augment > Author), which is the sensible tiebreak.

**2. Rename "Own" → "Author" (display only)**
- `BucketTile` for `summary.own_count` shows label `"Author"`.
- `BucketBadge` for `bucket === "OWN"` displays `"AUTHOR"` instead of `"OWN"`.

The underlying data type (`RoleTask["bucket"] = "AUTOMATE" | "AUGMENT" | "OWN"`) stays unchanged — this is a pure copy/label change in the UI, no data-model migration, no impact on the analysis function or other consumers.

## Out of scope
- Renaming the enum value `OWN` → `AUTHOR` across `assessment-types.ts` and the AI prompt (would touch the analysis function and risk old cached analyses breaking). Tell me if you want the full rename.
- Re-ordering the per-task breakdown list below — only the 3 summary tiles get ranked.
