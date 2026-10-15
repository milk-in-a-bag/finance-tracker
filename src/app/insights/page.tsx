import { SpendByTypeChart } from "@/components/web/spend-by-type-chart";
import { ActivityByDayChart } from "@/components/web/activity-by-day-chart";
import { PeriodSwitcher } from "@/components/web/period-switcher";
import { formatCounterparty } from "@/lib/utils";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

type TopSpend = {
  id: string;
  counterparty: string;
  amount: number;
  type: string;
  category: string | null;
  transactionDate: string;
};

type TopCounterparty = {
  counterparty: string;
  total: number;
  count: number;
  category: string | null;
};

type SpendByType = {
  type: string;
  total: number;
  count: number;
};

type DayStats = {
  day: string;
  count: number;
  total: number;
};

type AvgByCategory = {
  category: string;
  total: number;
  count: number;
  avg: number;
};

type RecurringPayee = {
  counterparty: string;
  count: number;
  total: number;
  category: string | null;
};

type UnparsedMessage = {
  id: string;
  rawSms: string;
  receivedAt: string;
  resolved: boolean;
};

const TYPE_STYLES: Record<string, string> = {
  SENT: "bg-rose-500/15 text-rose-400 border-rose-500/20",
  PAYBILL: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  AIRTIME: "bg-violet-500/15 text-violet-400 border-violet-500/20",
  WITHDRAWAL: "bg-amber-500/15 text-amber-400 border-amber-500/20",
};

const PERIOD_LABELS: Record<string, string> = {
  today: "today",
  week: "this week",
  month: "this month",
  year: "this year",
  all: "all time",
};

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "all" } = await searchParams;

  const res = await fetch(`${baseUrl}/api/insights?period=${period}`, {
    cache: "no-store",
  });
  const {
    topSpends = [],
    topCounterparties = [],
    concentrationPct = 0,
    top3Names = [],
    spendByType = [],
    busiestDay = [],
    avgByCategory = [],
    recurringPayees = [],
    uncategorizedCount = 0,
    uncategorizedTotal = 0,
    totalTransactions = 0,
    firstTransactionDate = null,
    unparsedMessages = [],
  } = await res.json();

  const sinceLabel = firstTransactionDate
    ? new Date(firstTransactionDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const periodLabel = PERIOD_LABELS[period] ?? "all time";

  return (
    <>
      <header className="h-14 flex items-center justify-between px-6 border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-base font-semibold">Insights</h1>
        <PeriodSwitcher current={period} basePath="/insights" />
      </header>

      <main className="flex-1 px-6 py-6 space-y-6">
        {/* ── Summary cards ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">
              Total Transactions
            </p>
            <p className="text-2xl font-bold text-primary">
              {totalTransactions}
            </p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Uncategorized</p>
              <AllTimeBadge />
            </div>
            <p
              className={`text-2xl font-bold ${uncategorizedCount > 0 ? "text-rose-400" : "text-emerald-400"}`}
            >
              {uncategorizedCount}
            </p>
            {uncategorizedCount > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Ksh {uncategorizedTotal.toFixed(2)}
              </p>
            )}
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">
              Recurring Payees
            </p>
            <p className="text-2xl font-bold text-violet-400">
              {recurringPayees.length}
            </p>
          </div>
          <div
            className={`bg-card border rounded-xl px-5 py-4 ${unparsedMessages.length > 0 ? "border-rose-500/40 bg-rose-500/5" : "border-border/60"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground">Failed to Parse</p>
              <AllTimeBadge />
            </div>
            <p
              className={`text-2xl font-bold ${unparsedMessages.length > 0 ? "text-rose-400" : "text-emerald-400"}`}
            >
              {unparsedMessages.length}
            </p>
            {unparsedMessages.length > 0 && (
              <p className="text-xs text-rose-400/70 mt-1">may affect totals</p>
            )}
          </div>
        </div>

        {/* ── Unparsed messages ──────────────────────────────────────────── */}
        {unparsedMessages.length > 0 && (
          <div className="bg-card border border-rose-500/30 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-rose-500/20 bg-rose-500/5 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-rose-400">
                  Unparsed Messages
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  These M-Pesa texts looked like expenses but failed to parse —
                  real spending may be missing from every number on this page.
                </p>
              </div>
              <span className="text-xs text-rose-400 font-semibold shrink-0 ml-4">
                {unparsedMessages.length} message
                {unparsedMessages.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ul className="divide-y divide-border/40 max-h-64 overflow-y-auto no-scrollbar">
              {(unparsedMessages as UnparsedMessage[]).map((m) => (
                <li key={m.id} className="px-5 py-3 flex flex-col gap-1">
                  <p className="text-xs font-mono text-muted-foreground break-all leading-relaxed">
                    {m.rawSms}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {new Date(m.receivedAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Row 1: Largest transactions + Top payees ──────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Largest transactions */}
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Largest Transactions
              </p>
            </div>
            {topSpends.length === 0 ? (
              <EmptySection message={`No transactions ${periodLabel}`} />
            ) : (
              <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border/60">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                        Counterparty
                      </th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 w-[90px]">
                        Type
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[130px]">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSpends.map((t: TopSpend, i: number) => (
                      <tr
                        key={t.id}
                        className="border-b border-border/40 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4 tabular-nums">
                              {i + 1}
                            </span>
                            <div>
                              <p className="font-medium truncate max-w-[160px]">
                                {formatCounterparty(t.counterparty)}
                              </p>
                              {t.category && (
                                <p className="text-xs text-muted-foreground">
                                  {t.category}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 w-[90px]">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${TYPE_STYLES[t.type] ?? "bg-muted text-muted-foreground border-border"}`}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td className="text-right font-semibold tabular-nums whitespace-nowrap px-5 py-3 w-[130px]">
                          Ksh {t.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Top payees */}
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground shrink-0">
                Top Payees
              </p>
              {concentrationPct > 0 && (
                <p className="text-xs text-amber-400">
                  Account for{" "}
                  <span className="font-semibold">{concentrationPct}%</span> of
                  spending {periodLabel}
                </p>
              )}
            </div>
            {topCounterparties.length === 0 ? (
              <EmptySection message={`No transactions ${periodLabel}`} />
            ) : (
              <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border/60">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                        Counterparty
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3 w-[60px]">
                        Txns
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[130px]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCounterparties.map((c: TopCounterparty, i: number) => (
                      <tr
                        key={c.counterparty}
                        className="border-b border-border/40 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4 tabular-nums">
                              {i + 1}
                            </span>
                            <div>
                              <p className="font-medium truncate max-w-[180px]">
                                {formatCounterparty(c.counterparty)}
                              </p>
                              {c.category && (
                                <p className="text-xs text-muted-foreground">
                                  {c.category}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-right tabular-nums text-muted-foreground px-3 py-3 w-[60px]">
                          {c.count}
                        </td>
                        <td className="text-right font-semibold tabular-nums whitespace-nowrap px-5 py-3 w-[130px]">
                          Ksh {c.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 2: Spend by type + Recurring payees ───────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-card border border-border/60 rounded-xl p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              Spend by Transaction Type
            </p>
            {spendByType.length === 0 ? (
              <EmptySection message={`No transactions ${periodLabel}`} />
            ) : (
              <SpendByTypeChart data={spendByType} />
            )}
          </div>

          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Recurring Payees
              </p>
              <span className="text-xs text-muted-foreground">
                2+ transactions
              </span>
            </div>
            {recurringPayees.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                <p className="text-sm">No recurring payees {periodLabel}</p>
                <p className="text-xs text-muted-foreground/60">
                  Payees you&apos;ve transacted with 2 or more times
                </p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border/60">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                        Counterparty
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3 w-[60px]">
                        Txns
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[130px]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringPayees.map((r: RecurringPayee) => (
                      <tr
                        key={r.counterparty}
                        className="border-b border-border/40 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3">
                          <p className="font-medium truncate max-w-[160px]">
                            {formatCounterparty(r.counterparty)}
                          </p>
                          {r.category && (
                            <p className="text-xs text-muted-foreground">
                              {r.category}
                            </p>
                          )}
                        </td>
                        <td className="text-right tabular-nums px-3 py-3 text-violet-400 font-semibold w-[60px]">
                          {r.count}×
                        </td>
                        <td className="text-right font-semibold tabular-nums whitespace-nowrap px-5 py-3 w-[130px]">
                          Ksh {r.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Row 3: Avg per category ────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Average Transaction by Category
              </p>
            </div>
            {avgByCategory.length === 0 ? (
              <EmptySection message={`No transactions ${periodLabel}`} />
            ) : (
              <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-card z-10">
                    <tr className="border-b border-border/60">
                      <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">
                        Category
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3 w-[60px]">
                        Txns
                      </th>
                      <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[130px]">
                        Avg
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {avgByCategory.map((c: AvgByCategory) => (
                      <tr
                        key={c.category}
                        className="border-b border-border/40 hover:bg-accent/30 transition-colors"
                      >
                        <td className="px-5 py-3 font-medium">{c.category}</td>
                        <td className="text-right tabular-nums text-muted-foreground px-3 py-3 w-[60px]">
                          {c.count}
                        </td>
                        <td className="text-right tabular-nums text-amber-400 font-semibold whitespace-nowrap px-5 py-3 w-[130px]">
                          Ksh {c.avg.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── All-time section (only on "all" period) ───────────────────── */}
        {period === "all" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-card border border-border/60 rounded-xl p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Activity by Day of Week
              </p>
              <ActivityByDayChart data={busiestDay} />
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-10 text-muted-foreground">
      <p className="text-sm">{message}</p>
    </div>
  );
}

function AllTimeBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border/60">
      All time
    </span>
  );
}
