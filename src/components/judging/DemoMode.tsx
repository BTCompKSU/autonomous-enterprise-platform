import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Ctx = { enabled: boolean; toggle: () => void };
const DemoModeContext = React.createContext<Ctx>({ enabled: false, toggle: () => {} });

export function DemoModeProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = React.useState(false);
  const value = React.useMemo(
    () => ({ enabled, toggle: () => setEnabled((v) => !v) }),
    [enabled],
  );
  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
}

export function useDemoMode() {
  return React.useContext(DemoModeContext);
}

export function DemoTip({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { enabled } = useDemoMode();
  return (
    <div className={cn("relative", className)}>
      {enabled && (
        <div className="pointer-events-none absolute -inset-2 rounded-2xl ring-2 ring-brand/70 ring-offset-2 ring-offset-background animate-pulse" />
      )}
      {enabled && (
        <div className="pointer-events-none absolute -top-3 left-3 z-20 flex items-center gap-1 rounded-full bg-brand px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-foreground shadow-lg">
          <Sparkles className="h-3 w-3" />
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

export function DemoToggle() {
  const { enabled, toggle } = useDemoMode();
  return (
    <button
      onClick={toggle}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        enabled
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      <Sparkles className="h-3.5 w-3.5" />
      Guided Demo {enabled ? "On" : "Off"}
    </button>
  );
}
