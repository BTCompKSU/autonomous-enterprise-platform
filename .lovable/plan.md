

Replace the user-facing label "OWN" with "AUTHOR" across the app while keeping the underlying type/enum values intact (changing the enum would require LLM prompt changes, DB migrations, and risk breaking stored analyses).

### Approach

Keep `TaskBucket = "AUTOMATE" | "AUGMENT" | "OWN"` in `assessment-types.ts` as-is (it's the contract with the LLM and stored data). Only swap the **display strings** in UI.

### Files to edit
