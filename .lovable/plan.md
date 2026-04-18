

## Root cause

Two broken pieces in the auth wiring:

1. **`AuthProvider` is never mounted.** `__root.tsx` wraps the tree in `QueryClientProvider` and `DemoModeProvider`, but not `AuthProvider`. Every `useAuth()` call returns the static `defaultState` (`loading: true`, `isAuthenticated: false`).
2. **Router context `auth` is never populated.** `getRouter()` initializes `context: { auth: undefined!, queryClient }` and nothing ever calls `router.update({ context })` to inject the live auth state.

Result: `_authed.tsx` `beforeLoad` reads `context.auth?.loading` → `undefined` (falsy), then `context.auth?.isAuthenticated` → `undefined` (falsy), and **always redirects to `/login`** — regardless of whether Supabase has a valid session in `localStorage`.

DB confirms both users (Brandon @ gmail and info@websites4everyone) are correctly set up: profile linked to org, `admin` role assigned. So the redirect-to-`/login` loop is purely a client-side wiring bug.

## Fix

### 1. Mount `AuthProvider` and sync auth → router context

Create a small `AuthRouterSync` component that lives inside `AuthProvider`, reads `useAuth()`, and pushes the value into the router context whenever it changes via `router.update({ context: { ...router.options.context, auth } })`. This is the standard TanStack pattern for context-driven guards.

Edit `src/routes/__root.tsx` `RootComponent`:

```tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <AuthRouterSync />
    <DemoModeProvider>
      <AppHeader />
      <Outlet />
      <Toaster richColors position="top-center" />
    </DemoModeProvider>
  </AuthProvider>
</QueryClientProvider>
```

`AuthRouterSync` (defined in the same file or `src/lib/auth-router-sync.tsx`):

```tsx
function AuthRouterSync() {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    router.update({ context: { ...router.options.context, auth } });
    // Re-run any pending guards once auth is hydrated
    if (!auth.loading) router.invalidate();
  }, [auth, router]);
  return null;
}
```

### 2. Verify guard logic still works

`src/routes/_authed.tsx` already correctly handles `auth?.loading`, so once the context is populated it'll let authenticated users through and only redirect anonymous users.

`src/routes/_authed/_admin.tsx` similarly checks `auth?.role !== "admin"` after loading — works once context is wired.

### 3. No DB / migration changes needed

Both affected users already have correct `profiles.org_id` and `user_roles.role = 'admin'` rows. The signup function ran successfully both times.

## Files touched

- `src/routes/__root.tsx` — wrap tree in `AuthProvider`, add `AuthRouterSync`

## Expected behavior after fix

- Sign in → `window.location.href = "/dashboard"` → page reloads → `AuthProvider` hydrates session from `localStorage` → `AuthRouterSync` pushes `auth` into router context → `_authed` guard sees `isAuthenticated: true, role: "admin", orgId: <uuid>` → renders `/dashboard`.
- New signup flow lands on `/dashboard` for the same reason; orphaned-org case correctly routes to `/join`.

