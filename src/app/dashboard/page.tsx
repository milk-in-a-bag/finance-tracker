import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategorySelector } from "@/components/web/category-selector";
import { PushRegistration } from "@/components/web/push-registration";
import { PeriodSwitcher } from "@/components/web/period-switcher";
import { CategoryBarChart } from "@/components/web/category-bar-chart";
import { SpendingTimeChart } from "@/components/web/spending-time-chart";

type TransactionRow = {
  id: string;
  transactionDate: string;
  counterparty: string;
  type: string;
  category: { id: string; name: string } | null;
  amount: string;
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

async function getSummary(period: string) {
  const res = await fetch(`${baseUrl}/api/summary?period=${period}`, {
    cache: "no-store",
  });
  return res.json();
}

async function getTransactions(period: string) {
  const res = await fetch(`${baseUrl}/api/transactions?period=${period}`, {
    cache: "no-store",
  });
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${baseUrl}/api/categories`, { cache: "no-store" });
  return res.json();
}

const TYPE_STYLES: Record<string, string> = {
  SENT: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  RECEIVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  PAYBILL: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  AIRTIME: "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "month" } = await searchParams;

  const [summary, { transactions }, { categories }] = await Promise.all([
    getSummary(period),
    getTransactions(period),
    getCategories(),
  ]);

  // Derive a quick category breakdown count for the stat card
  const categoryCount: number = summary.byCategory?.length ?? 0;

  return (
    <>
      <PushRegistration />

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-base font-semibold">Dashboard</h1>
        <PeriodSwitcher current={period} />
      </header>

      <main className="flex-1 px-6 py-6 space-y-6">
        {/* ── Stat cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Spend"
            value={`Ksh ${summary.overallTotal.toFixed(2)}`}
            prev={summary.previousTotal}
            current={summary.overallTotal}
            accent="primary"
          />
          <StatCard
            label="Transactions"
            value={String(transactions.length)}
            sub="this period"
            accent="teal"
          />
          <StatCard
            label="Categories"
            value={String(categoryCount)}
            sub="active"
            accent="amber"
          />
          <StatCard
            label="Avg. per Txn"
            value={
              transactions.length
                ? `Ksh ${(summary.overallTotal / transactions.length).toFixed(2)}`
                : "—"
            }
            sub="this period"
            accent="purple"
          />
        </div>

        {/* ── Charts ──────────────────────────────────────────────────── */}
        <div id="charts" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Spending Over Time
            </p>
            <SpendingTimeChart data={summary.timeSeries} />
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              By Category
            </p>
            <CategoryBarChart data={summary.byCategory} />
          </div>
        </div>

        {/* ── Transactions table ───────────────────────────────────────── */}
        <div
          id="transactions"
          className="bg-card border border-border/60 rounded-xl overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Transactions History
            </p>
            <span className="text-xs text-muted-foreground">
              {transactions.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <Table className="min-w-[680px]">
              <TableHeader>
                <TableRow className="border-border/60 hover:bg-transparent">
                  <TableHead className="text-muted-foreground pl-5 w-[110px]">
                    Date
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Counterparty
                  </TableHead>
                  <TableHead className="text-muted-foreground w-[110px]">
                    Type
                  </TableHead>
                  <TableHead className="text-muted-foreground w-[160px]">
                    Category
                  </TableHead>
                  <TableHead className="text-muted-foreground text-right pr-5 w-[120px]">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t: TransactionRow) => (
                  <TableRow
                    key={t.id}
                    className="border-border/40 hover:bg-accent/30 transition-colors"
                  >
                    <TableCell className="text-muted-foreground tabular-nums text-sm pl-5">
                      {new Date(t.transactionDate).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[200px] truncate">
                      {t.counterparty}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                          TYPE_STYLES[t.type] ??
                          "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {t.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <CategorySelector
                        transactionId={t.id}
                        categories={categories}
                        currentCategoryId={t.category?.id}
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums text-sm pr-5">
                      Ksh {Number(t.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </>
  );
}

/* ── Stat card ──────────────────────────────────────────────────────────── */

const ACCENT_CLASSES: Record<
  string,
  { bg: string; text: string; dot: string }
> = {
  primary: { bg: "bg-primary/10", text: "text-primary", dot: "bg-primary" },
  teal: { bg: "bg-teal-500/10", text: "text-teal-400", dot: "bg-teal-400" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  purple: {
    bg: "bg-violet-500/10",
    text: "text-violet-400",
    dot: "bg-violet-400",
  },
};

function StatCard({
  label,
  value,
  sub,
  accent = "primary",
  current,
  prev,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  current?: number;
  prev?: number;
}) {
  const a = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.primary;

  let delta: number | null = null;
  if (current != null && prev != null && prev > 0) {
    delta = ((current - prev) / prev) * 100;
  } else if (current != null && prev != null && prev === 0 && current > 0) {
    // Previous period had no spend — treat as new spending
    delta = 100;
  }

  return (
    <div className="bg-card border border-border/60 rounded-xl px-5 py-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span className={`w-2 h-2 rounded-full ${a.dot}`} />
      </div>
      <p className={`text-2xl font-bold tracking-tight ${a.text}`}>{value}</p>
      <div className="flex items-center gap-2">
        {delta !== null ? (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
              delta <= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {delta <= 0 ? (
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M8,12 L2,5 L14,5 Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3">
                <path d="M8,4 L14,11 L2,11 Z" />
              </svg>
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        ) : null}
        <span className="text-xs text-muted-foreground">
          {delta !== null ? "vs last period" : (sub ?? "this period")}
        </span>
      </div>
    </div>
  );
}
