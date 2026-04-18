import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/step-3")({
  beforeLoad: () => {
    throw redirect({ to: "/onboarding/step-3" });
  },
});
