import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/preview/executive-audit")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "executives" });
  },
});
