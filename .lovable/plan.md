
The nav uses `text-warning` (currently `oklch(0.78 0.16 70)` — an orange-leaning amber), but the logo and landing-page gold is `#F5C84C` (a warmer, more saturated yellow-gold). These don't match.

## Fix

Update `--warning` in `src/styles.css` to match the logo's `#F5C84C`. This single token change cascades to:
- Active nav pill text (`text-warning` in `AppShell.tsx`)
- "Watch Demo" button text
- User avatar background and admin role badge in the user menu
- Any other `bg-warning` / `text-warning` / `border-warning` usage across the app

`#F5C84C` in OKLCH is approximately `oklch(0.84 0.15 88)` — keeps the same lightness/chroma feel as the existing token but shifts hue from orange (~70°) to warm yellow-gold (~88°) so it visually matches the logo and the landing-page gold accents (`#F5C84C` used inline in `AuditSplash`, onboarding, etc.).

Both light and dark themes get the same warning value so the gold is consistent everywhere.

### Change

`src/styles.css`:
- `:root` → `--warning: oklch(0.84 0.15 88);` (was `oklch(0.78 0.16 70)`)
- `.dark` → same value

No component changes needed — semantic token already wired up correctly.
