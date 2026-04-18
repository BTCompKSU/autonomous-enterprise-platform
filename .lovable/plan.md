

## Plan — Crop logo + enlarge to match nav

### Problem
The logo PNG is 1264×848 RGB (no real alpha channel) with the actual artwork sitting in the top-left corner surrounded by huge empty padding. The browser is rendering the surrounding area as a checkered/empty box, making the visible logo look tiny next to the nav links.

### Fix

**1. Re-process the logo asset** (`src/assets/upskill-usa-logo.png`)
- Convert to RGBA mode so transparency works.
- Make the white/checker background fully transparent.
- Auto-crop to the logo's tight bounding box (remove all empty padding around the artwork).
- Save back to `src/assets/upskill-usa-logo.png`.

**2. Enlarge the logo in the header** (`src/components/AppShell.tsx`)
- Header container is currently `h-20` (80px) with logo at `h-14` (56px).
- Bump logo to `h-16` (64px) so the cropped artwork fills the nav row height and reads at the same visual weight as the nav link text.
- Keep `w-auto` so aspect ratio is preserved after cropping.

### Files touched
- `src/assets/upskill-usa-logo.png` (re-processed: transparent bg + tight crop)
- `src/components/AppShell.tsx` (logo height `h-14` → `h-16`)

