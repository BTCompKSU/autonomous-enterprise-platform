import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed")({
  beforeLoad: ({ context, location }) => {
    if (context.auth?.loading) return;
    if (!context.auth?.isAuthenticated) {
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
    if (!context.auth.orgId) {
      // Authenticated but not linked to an org yet
      throw redirect({ to: "/join" });
    }
  },
  component: () => <Outlet />,
});
