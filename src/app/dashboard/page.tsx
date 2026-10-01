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
import { DeltaBadge } from "@/components/web/delta-badge";

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
            unit="ksh"
            accent="primary"
          />
          <StatCard
            label="Transactions"
            value={String(transactions.length)}
            current={transactions.length}
            prev={summary.previousCount}
            unit="count"
            accent="teal"
          />
          <StatCard
            label="Categories"
            value={String(categoryCount)}
            accent="amber"
          />
          <StatCard
            label="Average per transaction"
            value={
              transactions.length
                ? `Ksh ${(summary.overallTotal / transactions.length).toFixed(2)}`
                : "—"
            }
            current={
              transactions.length
                ? summary.overallTotal / transactions.length
                : undefined
            }
            prev={summary.previousAvg}
            unit="ksh"
            accent="purple"
          />
        </div>

        {/* ── Charts ──────────────────────────────────────────────────── */}
        <div id="charts" className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Spending Over Time
            </p>
            {summary.timeSeries?.length > 0 ? (
              <SpendingTimeChart data={summary.timeSeries} />
            ) : (
              <EmptyChart message="No spending data for this period" />
            )}
          </div>
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              By Category
            </p>
            {summary.byCategory?.length > 0 ? (
              <CategoryBarChart data={summary.byCategory} />
            ) : (
              <EmptyChart message="No category data for this period" />
            )}
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

          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="w-10 h-10 opacity-40"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z"
                />
              </svg>
              <p className="text-sm">No transactions this period</p>
            </div>
          ) : (
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
                        {new Date(t.transactionDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "2-digit",
                          },
                        )}
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
          )}
        </div>
      </main>
    </>
  );
}

/* ── Empty chart placeholder ────────────────────────────────────────────── */

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-muted-foreground">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        className="w-8 h-8 opacity-40"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
        />
      </svg>
      <p className="text-xs">{message}</p>
    </div>
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
  unit,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
  current?: number;
  prev?: number;
  unit?: "ksh" | "count";
}) {
  const a = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.primary;
  const showDelta = current != null;

  return (
    <div className="bg-card border border-border/60 rounded-xl px-5 py-4 flex flex-col gap-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <p className={`text-2xl font-bold tracking-tight ${a.text}`}>{value}</p>
      <div className="h-4 flex items-center">
        {showDelta ? (
          <DeltaBadge current={current!} prev={prev} unit={unit} />
        ) : (
          <span className="text-xs text-muted-foreground">
            {sub ?? "this period"}
          </span>
        )}
      </div>
    </div>
  );
}
