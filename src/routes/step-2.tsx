import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/step-2")({
  beforeLoad: () => {
    throw redirect({ to: "/onboarding/step-2" });
  },
});
