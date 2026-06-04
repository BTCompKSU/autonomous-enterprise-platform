import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/opportunity")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "opportunity" });
  },
});
