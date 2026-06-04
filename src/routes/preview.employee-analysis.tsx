import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/preview/employee-analysis")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "employees" });
  },
});
