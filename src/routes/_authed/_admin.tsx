import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authed/_admin")({
  beforeLoad: ({ context, location }) => {
    if (context.auth?.loading) return;
    if (context.auth?.role !== "admin") {
      throw redirect({ to: "/employee", search: { redirect: location.href } as never });
    }
  },
  component: () => <Outlet />,
});
