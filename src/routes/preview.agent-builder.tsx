import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/preview/agent-builder")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "emulators" });
  },
});
