import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Zap,
  LayoutGrid,
  History,
  Users,
  Settings,
  Mail,
  Sparkles,
  Gauge,
  UserCheck,
  CheckCircle2,
  Database,
  BookOpen,
  Play,
  Download,
  Clock,
  ShieldCheck,
  Heart,
  FileText,
  RefreshCw,
  Maximize2,
  AlertTriangle,
  UserRound,
  Brain,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export const Route = createFileRoute("/workflowai")({
  head: () => ({
    meta: [
      { title: "WorkflowAI — Agent Builder Demo" },
      {
        name: "description",
        content:
          "Build, simulate, and govern AI workflows with human-in-the-loop review. Demo: Invoice Processing for Meridian Financial Group.",
      },
      { property: "og:title", content: "WorkflowAI — Agent Builder Demo" },
      {
        property: "og:description",
        content:
          "Visual agent builder with confidence-based human review. Watch invoices flow through extract → check → approve → export.",
      },
    ],
  }),
  component: WorkflowAIPage,
});

// ============= HARDCODED DATA =============
const DATA = {
  company: "Meridian Financial Group",
  industry: "Financial Services",
  employees: 850,
  employee: { name: "Maria Reyes", role: "Sr. AP Analyst", aiScore: 7.6 },
  workflow: "Invoice Processing Automation",
  hoursWeek: 8,
  hoursMonth: 32,
  annualValue: 2_100_000,
  autoRate: 67,
  errorRate: 1.8,
  industryError: 4.2,
  ownership: { automate: 43, augment: 32, own: 25 },
  runs: [
    {
      id: "invoice_001.pdf",
      confidence: 0.98,
      before: 25,
      after: 3,
      corrections: [] as string[],
    },
    {
      id: "invoice_002.pdf",
      confidence: 0.94,
      before: 20,
      after: 4,
      corrections: [] as string[],
    },
    {
      id: "invoice_003.pdf",
      confidence: 0.72,
      before: 30,
      after: 10,
      corrections: ["po_number", "amount"],
    },
  ],
};

// ============= MAIN PAGE =============
function WorkflowAIPage() {
  const [threshold, setThreshold] = useState(0.9);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeNode, setActiveNode] = useState<number | null>(null);
  const [reviewedRun3, setReviewedRun3] = useState(false);
  const [feedbackLog, setFeedbackLog] = useState<string[]>([
    "[run_003] po_number correction logged ✓",
    "[run_003] amount correction logged ✓",
    "[run_001] auto-approved — no feedback needed",
  ]);

  // Derived run statuses based on threshold
  const runStatuses = useMemo(
    () =>
      DATA.runs.map((r) => ({
        ...r,
        autoApproved: r.confidence >= threshold,
        saved: r.before - r.after,
      })),
    [threshold],
  );

  const totalSaved = runStatuses.reduce((s, r) => s + r.saved, 0);
  const autoCount = runStatuses.filter((r) => r.autoApproved).length;
  const liveAutoRate = Math.round((autoCount / runStatuses.length) * 100);
  const liveHoursWeek = +(DATA.hoursWeek + (reviewedRun3 ? 0.2 : 0)).toFixed(1);

  function runSimulation() {
    if (running) return;
    setRunning(true);
    setProgress(0);
    setActiveNode(1);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 2500);
      setProgress(Math.round(t * 100));
      const node = Math.min(7, 1 + Math.floor(t * 7));
      setActiveNode(node);
      if (t < 1) requestAnimationFrame(tick);
      else {
        setTimeout(() => {
          setRunning(false);
          setActiveNode(null);
        }, 400);
      }
    };
    requestAnimationFrame(tick);
  }

  function approveCorrections() {
    if (reviewedRun3) return;
    setReviewedRun3(true);
    setFeedbackLog((l) => [
      `[run_003] reviewed & approved by ${DATA.employee.name} ✓`,
      ...l,
    ]);
  }

  function exportJSON() {
    const blob = new Blob(
      [
        JSON.stringify(
          { workflow: DATA.workflow, threshold, runs: runStatuses },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workflowai-export.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans text-slate-100 antialiased">
      <style>{`
        @keyframes flowdash { to { stroke-dashoffset: -20; } }
        .flow-line { stroke-dasharray: 6 4; animation: flowdash 1.2s linear infinite; }
        @keyframes nodeGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); } 50% { box-shadow: 0 0 0 6px rgba(79,70,229,0.35); } }
        .node-active { animation: nodeGlow 1s ease-in-out infinite; }
      `}</style>

      <div className="flex min-h-screen">
        <SideNav />
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar
            running={running}
            progress={progress}
            onRun={runSimulation}
            onExport={exportJSON}
          />
          <main className="flex-1 overflow-x-hidden p-4 md:p-6">
            <Tabs defaultValue="builder" className="w-full">
              <TabsList className="bg-slate-800/60 text-slate-400">
                <TabsTrigger value="builder" className="data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white">
                  Workflow Canvas
                </TabsTrigger>
                <TabsTrigger value="runs" className="data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white">
                  Run Simulator
                </TabsTrigger>
                <TabsTrigger value="oversight" className="data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white">
                  Human Oversight
                </TabsTrigger>
                <TabsTrigger value="impact" className="data-[state=active]:bg-[#4F46E5] data-[state=active]:text-white">
                  Impact
                </TabsTrigger>
              </TabsList>

              <TabsContent value="builder" className="mt-4">
                <WorkflowCanvas
                  activeNode={activeNode}
                  threshold={threshold}
                  setThreshold={setThreshold}
                />
              </TabsContent>
              <TabsContent value="runs" className="mt-4">
                <RunSimulator runs={runStatuses} totalSaved={totalSaved} running={running} />
              </TabsContent>
              <TabsContent value="oversight" className="mt-4">
                <OversightQueue
                  run3={runStatuses[2]}
                  reviewed={reviewedRun3}
                  onApprove={approveCorrections}
                  feedbackLog={feedbackLog}
                />
              </TabsContent>
              <TabsContent value="impact" className="mt-4">
                <ImpactDashboard
                  hoursWeek={liveHoursWeek}
                  autoRate={liveAutoRate}
                />
              </TabsContent>
            </Tabs>

            <footer className="mt-10 flex items-center justify-center gap-2 border-t border-slate-800 py-6 text-xs text-slate-500">
              <Sparkles className="h-3.5 w-3.5 text-[#4F46E5]" />
              Powered by AI · WorkflowAI Demo
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}

// ============= SIDEBAR =============
function SideNav() {
  const items = [
    { icon: Sparkles, label: "Agent Builder", active: true },
    { icon: LayoutGrid, label: "My Workflows" },
    { icon: History, label: "Run History" },
    { icon: Users, label: "Team" },
    { icon: Settings, label: "Settings" },
  ];
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800 bg-slate-900/60 md:flex">
      <div className="flex items-center gap-2 border-b border-slate-800 px-5 py-4">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#4F46E5]">
          <Zap className="h-4 w-4 text-white" />
        </span>
        <div className="text-sm font-semibold tracking-tight">
          Workflow<span className="text-[#4F46E5]">AI</span>
        </div>
      </div>
      <nav className="flex-1 p-3">
        {items.map((it) => (
          <button
            key={it.label}
            className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              it.active
                ? "bg-[#4F46E5]/15 text-white ring-1 ring-[#4F46E5]/40"
                : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
            }`}
          >
            <it.icon className="h-4 w-4" />
            {it.label}
          </button>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/40 p-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#4F46E5] to-[#10B981] text-sm font-bold">
            MR
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{DATA.employee.name}</div>
            <div className="truncate text-[10px] text-slate-400">{DATA.employee.role}</div>
          </div>
          <span className="rounded-full bg-[#10B981]/15 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
            {DATA.employee.aiScore}
          </span>
        </div>
      </div>
    </aside>
  );
}

// ============= TOP BAR =============
function TopBar({
  running,
  progress,
  onRun,
  onExport,
}: {
  running: boolean;
  progress: number;
  onRun: () => void;
  onExport: () => void;
}) {
  return (
    <div className="border-b border-slate-800 bg-slate-900/40 backdrop-blur">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Workflows</span>
          <span className="text-slate-600">/</span>
          <span className="font-medium text-slate-200">Invoice Processing Automation</span>
        </div>
        <span className="rounded-full bg-[#F59E0B]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#F59E0B]">
          Simulated
        </span>
        <span className="hidden rounded-full border border-slate-700 px-2.5 py-0.5 text-[10px] text-slate-400 md:inline">
          {DATA.company} · {DATA.employees} employees
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={onExport}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
          <button
            onClick={onRun}
            disabled={running}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#4F46E5] px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-[#4F46E5]/20 transition hover:bg-[#4338CA] disabled:opacity-60"
          >
            <Play className="h-3.5 w-3.5" />
            {running ? "Running…" : "Run Simulation"}
          </button>
        </div>
      </div>
      {running && (
        <div className="h-0.5 w-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-[#4F46E5] to-[#10B981] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ============= PANEL 1: WORKFLOW CANVAS =============
type NodeDef = {
  id: number;
  x: number;
  y: number;
  w: number;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  color: string;
  diamond?: boolean;
  pills?: string[];
};

// Layout: vertical center axis ~x=550. node_4 sits LEFT of axis.
const NODES: NodeDef[] = [
  { id: 1, x: 440, y: 30,  w: 220, icon: Mail,        label: "Incoming Invoice",      sub: "Source: Email / Upload",   color: "border-slate-600" },
  { id: 2, x: 430, y: 160, w: 240, icon: Sparkles,    label: "Extract Invoice Data",  sub: "7 fields extracted",       color: "border-[#4F46E5]", pills: ["vendor_name", "invoice_number", "amount", "po_number", "due_date", "line_items"] },
  { id: 3, x: 450, y: 340, w: 200, icon: Gauge,       label: "Confidence Check",      sub: "Threshold control",        color: "border-[#4F46E5]", diamond: true },
  { id: 4, x: 120, y: 470, w: 240, icon: UserCheck,   label: "Maria Review Queue",    sub: "Reviewer: Maria Reyes",    color: "border-[#F59E0B]" },
  { id: 5, x: 430, y: 600, w: 240, icon: CheckCircle2,label: "Approval Step",         sub: "Auto or Manual",           color: "border-[#10B981]" },
  { id: 6, x: 430, y: 730, w: 240, icon: Database,    label: "Export to Finance",     sub: "Destination: ERP_SIM",     color: "border-sky-500" },
  { id: 7, x: 430, y: 860, w: 240, icon: BookOpen,    label: "Learning Feedback",     sub: "Corrections → model",      color: "border-purple-500" },
];

function WorkflowCanvas({
  activeNode,
  threshold,
  setThreshold,
}: {
  activeNode: number | null;
  threshold: number;
  setThreshold: (v: number) => void;
}) {
  // Connectors as SVG paths
  const connectors = [
    { from: 1, to: 2, color: "#475569" },
    { from: 2, to: 3, color: "#4F46E5" },
    { from: 3, to: 4, color: "#F59E0B", label: "confidence < threshold" },
    { from: 3, to: 5, color: "#10B981", label: "confidence ≥ threshold" },
    { from: 4, to: 5, color: "#10B981" },
    { from: 5, to: 6, color: "#3B82F6" },
    { from: 6, to: 7, color: "#A855F7" },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Workflow Canvas</h3>
          <span className="text-[10px] text-slate-500">Hover nodes for config</span>
        </div>
        <div className="relative h-[860px] w-full overflow-auto rounded-xl bg-[radial-gradient(circle,_rgba(71,85,105,0.25)_1px,_transparent_1px)] [background-size:18px_18px]">
          <svg className="absolute inset-0 h-[860px] w-[900px]" style={{ pointerEvents: "none" }}>
            {connectors.map((c, i) => {
              const a = NODES.find((n) => n.id === c.from)!;
              const b = NODES.find((n) => n.id === c.to)!;
              const ax = a.x + a.w / 2;
              const ay = a.y + 60;
              const bx = b.x + b.w / 2;
              const by = b.y + 10;
              const mid = (ay + by) / 2;
              const path = `M ${ax} ${ay} C ${ax} ${mid}, ${bx} ${mid}, ${bx} ${by}`;
              return (
                <g key={i}>
                  <path d={path} stroke={c.color} strokeWidth={2} fill="none" className="flow-line" opacity={0.85} />
                  {c.label && (
                    <text x={(ax + bx) / 2} y={mid - 6} textAnchor="middle" fill={c.color} fontSize="10" className="font-medium">
                      {c.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {NODES.map((n) => {
            const Icon = n.icon;
            const active = activeNode === n.id;
            return (
              <div
                key={n.id}
                className="group absolute"
                style={{ left: n.x, top: n.y, width: n.w }}
                title={JSON.stringify({ id: n.id, label: n.label }, null, 2)}
              >
                <div
                  className={`relative rounded-xl border-2 ${n.color} bg-slate-900/90 p-3 shadow-lg transition ${
                    active ? "node-active scale-[1.03] ring-2 ring-[#4F46E5]/60" : ""
                  } ${n.diamond ? "rotate-45" : ""}`}
                >
                  <div className={n.diamond ? "-rotate-45" : ""}>
                    <div className="flex items-center gap-2">
                      <span className="grid h-7 w-7 place-items-center rounded-md bg-slate-800">
                        <Icon className="h-3.5 w-3.5 text-slate-200" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold">{n.label}</div>
                        <div className="truncate text-[10px] text-slate-400">{n.sub}</div>
                      </div>
                    </div>
                    {n.pills && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {n.pills.map((p) => (
                          <span key={p} className="rounded bg-[#4F46E5]/15 px-1.5 py-0.5 text-[9px] font-mono text-[#A5B4FC]">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {n.id === 3 && (
                      <div className="mt-2 text-[10px] text-slate-400">
                        Threshold: <span className="font-mono text-white">{(threshold * 100).toFixed(0)}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-[#4F46E5]" />
            <h3 className="text-sm font-semibold">Threshold Config</h3>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Tasks below this confidence route to {DATA.employee.name}.
          </p>
          <div className="mt-4 flex items-end justify-between">
            <span className="text-[10px] text-slate-500">0.70</span>
            <span className="text-2xl font-bold text-[#4F46E5]">
              {(threshold * 100).toFixed(0)}%
            </span>
            <span className="text-[10px] text-slate-500">1.00</span>
          </div>
          <div className="mt-2">
            <Slider
              value={[threshold * 100]}
              onValueChange={(v) => setThreshold(v[0] / 100)}
              min={70}
              max={100}
              step={1}
            />
          </div>
          <p className="mt-3 text-[10px] text-slate-500">
            Drag to see invoice routing update live across all panels.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h4 className="text-xs font-semibold text-slate-300">Legend</h4>
          <ul className="mt-2 space-y-1.5 text-[11px] text-slate-400">
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#4F46E5]" /> AI step</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#F59E0B]" /> Human review</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#10B981]" /> Auto-approved</li>
            <li className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-purple-500" /> Feedback loop</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============= PANEL 2: RUN SIMULATOR =============
function RunSimulator({
  runs,
  totalSaved,
  running,
}: {
  runs: (typeof DATA.runs[number] & { autoApproved: boolean; saved: number })[];
  totalSaved: number;
  running: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 md:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Simulation Runs</h3>
        <span className="text-[11px] text-slate-400">{running ? "Running…" : "Idle"}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {runs.map((r, i) => {
          const conf = Math.round(r.confidence * 100);
          const auto = r.autoApproved;
          const tone = auto ? "#10B981" : "#F59E0B";
          return (
            <div
              key={r.id}
              className="animate-fade-in rounded-xl border border-slate-800 bg-slate-900/70 p-4"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-mono text-slate-300">{r.id}</span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{ background: `${tone}22`, color: tone }}
                >
                  {auto ? (i === 0 ? "Auto-Approved" : "Approved") : "Human Review"}
                </span>
              </div>

              <div className="my-4 flex justify-center">
                <div
                  className="grid h-20 w-20 place-items-center rounded-full text-xl font-bold"
                  style={{
                    background: `${tone}15`,
                    color: tone,
                    boxShadow: `0 0 0 2px ${tone}40 inset`,
                  }}
                >
                  {conf}%
                </div>
              </div>

              <div className="space-y-1 text-[11px] text-slate-400">
                <div className="flex justify-between">
                  <span>confidence_score</span>
                  <span className="font-mono text-slate-200">{r.confidence.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>review_required</span>
                  <span className="font-mono text-slate-200">{auto ? "No" : "Yes"}</span>
                </div>
                {!auto && (
                  <div className="flex justify-between">
                    <span>reviewer</span>
                    <span className="font-mono text-slate-200">Maria Reyes</span>
                  </div>
                )}
              </div>

              {r.corrections.length > 0 && !auto && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {r.corrections.map((c) => (
                    <span key={c} className="rounded bg-[#F59E0B]/15 px-1.5 py-0.5 text-[10px] font-mono text-[#F59E0B]">
                      {c}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 rounded-lg bg-slate-800/60 p-2.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Before</span>
                  <span className="font-mono text-slate-300">{r.before} min</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>After</span>
                  <span className="font-mono text-slate-300">{r.after} min</span>
                </div>
                <div className="mt-1 flex items-center justify-between border-t border-slate-700 pt-1">
                  <span className="font-medium text-[#10B981]">Saved</span>
                  <span className="font-mono font-bold text-[#10B981]">{r.saved} min</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border border-[#10B981]/30 bg-[#10B981]/10 px-4 py-3 text-center">
        <span className="text-xs uppercase tracking-wide text-[#10B981]">Total Time Recovered This Batch</span>
        <div className="mt-0.5 text-2xl font-bold text-white">{totalSaved} minutes</div>
      </div>
    </div>
  );
}

// ============= PANEL 3: OVERSIGHT =============
function OversightQueue({
  run3,
  reviewed,
  onApprove,
  feedbackLog,
}: {
  run3: typeof DATA.runs[number] & { autoApproved: boolean; saved: number };
  reviewed: boolean;
  onApprove: () => void;
  feedbackLog: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Review Queue */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-3 flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-[#F59E0B]" />
            <h3 className="text-sm font-semibold">Maria's Review Queue</h3>
          </div>
          <div
            className={`rounded-xl border p-4 transition-colors ${
              reviewed
                ? "border-[#10B981]/40 bg-[#10B981]/10"
                : "border-[#F59E0B]/40 bg-[#F59E0B]/5"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-slate-200">{run3.id}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  reviewed
                    ? "bg-[#10B981]/20 text-[#10B981]"
                    : "bg-[#F59E0B]/20 text-[#F59E0B]"
                }`}
              >
                {reviewed ? "Reviewed & Approved" : "Pending review"}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Reason: Low confidence: {Math.round(run3.confidence * 100)}% (below 90% threshold)
            </p>
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wide text-slate-500">Fields flagged</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {run3.corrections.map((c) => (
                  <span key={c} className="rounded bg-[#F59E0B]/15 px-2 py-0.5 text-[11px] font-mono text-[#F59E0B]">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            {!reviewed && (
              <div className="mt-4 flex gap-2">
                <button
                  onClick={onApprove}
                  className="flex-1 rounded-lg bg-[#10B981] px-3 py-2 text-xs font-semibold text-white hover:bg-[#059669]"
                >
                  Approve Corrections ✓
                </button>
                <button className="flex-1 rounded-lg border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800">
                  Reject ✗
                </button>
              </div>
            )}
            {reviewed && (
              <div className="mt-4 flex items-center gap-2 text-xs text-[#10B981]">
                <CheckCircle2 className="h-4 w-4" />
                Corrections logged. Model will retrain on this signal.
              </div>
            )}
          </div>
        </div>

        {/* Feedback Log */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 animate-pulse text-[#4F46E5]" />
            <h3 className="text-sm font-semibold">AI Learning Log</h3>
          </div>
          <div className="rounded-lg bg-black/40 p-3 font-mono text-[11px] leading-relaxed text-slate-300">
            {feedbackLog.map((line, i) => (
              <div key={i} className="animate-fade-in">
                <span className="text-slate-600">$ </span>
                {line}
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-slate-400">
            These corrections improve future extraction accuracy.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
        <h3 className="text-sm font-semibold">Maria's Workload Impact</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <MiniStat label="Invoices this week" value="24" />
          <MiniStat label="Auto-resolved" value="16" sub="67%" tone="#10B981" />
          <MiniStat label="Required review" value="8" sub="33%" tone="#F59E0B" />
          <MiniStat label="Focus time freed" value="8 hrs" sub="per week" tone="#4F46E5" />
        </div>
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
  tone = "#E2E8F0",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-xl font-bold" style={{ color: tone }}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
    </div>
  );
}

// ============= PANEL 4: IMPACT =============
function useCountUp(target: number, durationMs = 800) {
  const [val, setVal] = useState(0);
  const ref = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const from = ref.current;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const v = from + (target - from) * t;
      setVal(v);
      if (t < 1) requestAnimationFrame(tick);
      else ref.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, durationMs]);
  return val;
}

function ImpactDashboard({ hoursWeek, autoRate }: { hoursWeek: number; autoRate: number }) {
  const animHours = useCountUp(hoursWeek);
  const animRate = useCountUp(autoRate);
  const animErr = useCountUp(DATA.errorRate);

  const beforeAfter = [
    { task: "Invoice Entry", before: 15, after: 2 },
    { task: "3-Way Match", before: 10, after: 3 },
    { task: "Vendor Check", before: 8, after: 1 },
    { task: "Approval Routing", before: 12, after: 2 },
  ];
  const ownership = [
    { name: "Automate", value: DATA.ownership.automate, color: "#4F46E5" },
    { name: "Augment", value: DATA.ownership.augment, color: "#F59E0B" },
    { name: "Own", value: DATA.ownership.own, color: "#10B981" },
  ];
  const autoDonut = [
    { name: "Auto", value: autoRate, color: "#10B981" },
    { name: "Review", value: 100 - autoRate, color: "#F59E0B" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Workflow Impact</h3>
        <p className="text-xs text-slate-400">{DATA.company} · Invoice Processing</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Clock}
          tone="#10B981"
          big={`${animHours.toFixed(1)} hrs`}
          label="Hours Saved / Week"
          sub={`${DATA.hoursMonth} hrs/month · 384 hrs/year`}
        />
        <KpiCard
          icon={Zap}
          tone="#4F46E5"
          big={`${Math.round(animRate)}%`}
          label="Auto-Approved Rate"
          sub={`${100 - Math.round(animRate)}% routed to human review`}
          chart={
            <ResponsiveContainer width={56} height={56}>
              <PieChart>
                <Pie data={autoDonut} dataKey="value" innerRadius={16} outerRadius={26} stroke="none">
                  {autoDonut.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          }
        />
        <KpiCard
          icon={ShieldCheck}
          tone="#10B981"
          big={`${animErr.toFixed(1)}%`}
          label="Error Rate"
          sub={`Industry avg: ${DATA.industryError}% · You're 57% better`}
        />
        <KpiCard
          icon={Heart}
          tone="#A855F7"
          big="0"
          label="Jobs Displaced"
          sub="Maria is augmented, not replaced"
          warm
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h4 className="mb-3 text-sm font-semibold">Time Per Invoice: Before vs After AI</h4>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={beforeAfter}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="task" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <RTooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="before" name="Before AI" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="after" name="After AI" fill="#4F46E5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <h4 className="mb-3 text-sm font-semibold">Task Ownership Breakdown</h4>
          <div className="relative">
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={ownership} dataKey="value" innerRadius={60} outerRadius={90} stroke="none" paddingAngle={2}>
                  {ownership.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <RTooltip contentStyle={{ background: "#0F172A", border: "1px solid #334155", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-[10px] uppercase tracking-wide text-slate-400">Maria's</div>
              <div className="text-sm font-bold">Role Mix</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
            {ownership.map((o) => (
              <div key={o.name} className="rounded-lg bg-slate-800/50 p-2">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: o.color }} />
                  <span className="font-semibold">{o.name}</span>
                  <span className="ml-auto font-mono">{o.value}%</span>
                </div>
                <div className="mt-0.5 text-[10px] text-slate-400">
                  {o.name === "Automate" && "Fully handled by AI"}
                  {o.name === "Augment" && "AI-assisted, Maria decides"}
                  {o.name === "Own" && "Maria leads entirely"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#4F46E5] via-[#6366F1] to-[#A855F7] p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-white/70">
              Annual Productivity Value Recovered
            </div>
            <div className="text-3xl font-bold text-white md:text-4xl">
              ${(DATA.annualValue / 1_000_000).toFixed(1)}M
            </div>
            <div className="text-xs text-white/80">
              Based on {DATA.employees} employees · 384 hours/year recovered · Finance operations
            </div>
          </div>
          <RefreshCw className="ml-auto hidden h-12 w-12 text-white/20 md:block" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  tone,
  big,
  label,
  sub,
  chart,
  warm,
}: {
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
  big: string;
  label: string;
  sub: string;
  chart?: React.ReactNode;
  warm?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        warm
          ? "border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/10"
          : "border-slate-800 bg-slate-900/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded-lg"
            style={{ background: `${tone}20` }}
          >
            <Icon className="h-4 w-4" />
          </span>
          <span className="text-[11px] uppercase tracking-wide text-slate-400">{label}</span>
        </div>
        {chart}
      </div>
      <div className="mt-3 text-3xl font-bold" style={{ color: tone }}>
        {big}
      </div>
      <div className="mt-1 text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}
