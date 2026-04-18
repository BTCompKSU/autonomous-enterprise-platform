import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { DemoModeProvider } from "@/components/judging/DemoMode";
import { AppHeader } from "@/components/AppShell";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import type { RouterContext } from "@/router";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "UpSkill USA — The Reliable Autonomous Workforce Platform" },
      {
        name: "description",
        content:
          "From AI Pilots to Reliable Autonomous Operations. Deploy enterprise AI agents with confidence scoring, human oversight, and measurable workforce impact.",
      },
      { name: "author", content: "UpSkill USA" },
      { property: "og:title", content: "UpSkill USA — The Reliable Autonomous Workforce Platform" },
      { property: "og:description", content: "From AI Pilots to Reliable Autonomous Operations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function AuthBridge() {
  const auth = useAuth();
  const router = useRouter();
  useEffect(() => {
    router.update({ context: { ...router.options.context, auth } });
    void router.invalidate();
  }, [auth, router]);
  return null;
}

function RootComponent() {
  return (
    <AuthProvider>
      <AuthBridge />
      <DemoModeProvider>
        <AppHeader />
        <Outlet />
        <Toaster richColors position="top-center" />
      </DemoModeProvider>
    </AuthProvider>
  );
}
