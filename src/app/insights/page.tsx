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
};

type RecurringItem = {
  counterparty: string;
  count: number;
  typicalAmount: number;
  category: string | null;
};

const TYPE_STYLES: Record<string, string> = {
  SENT:     "bg-rose-500/15 text-rose-400 border-rose-500/20",
  RECEIVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  PAYBILL:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  AIRTIME:  "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

export default async function InsightsPage() {
  const res = await fetch(`${baseUrl}/api/insights`, { cache: "no-store" });
  const { topSpends, topCounterparties, recurring, uncategorizedCount, totalTransactions } = await res.json();

  return (
    <>
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-base font-semibold">Insights</h1>
      </header>

      <main className="flex-1 px-6 py-6 space-y-6">

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-primary">{totalTransactions}</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Uncategorized</p>
            <p className={`text-2xl font-bold ${uncategorizedCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              {uncategorizedCount}
            </p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Recurring Payees</p>
            <p className="text-2xl font-bold text-violet-400">{recurring.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Top 10 spends */}
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Largest Transactions
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Counterparty</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 w-[90px]">Type</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[110px]">Amount</th>
                </tr>
              </thead>
              <tbody>
                {topSpends.map((t: TopSpend, i: number) => (
                  <tr key={t.id} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                        <div>
                          <p className="font-medium truncate max-w-[160px]">{t.counterparty}</p>
                          {t.category && (
                            <p className="text-xs text-muted-foreground">{t.category}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${TYPE_STYLES[t.type] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="text-right font-semibold tabular-nums px-5 py-2.5">
                      Ksh {t.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Top counterparties */}
          <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Top Payees by Total Spend
              </p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Counterparty</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3">Txns</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[110px]">Total</th>
                </tr>
              </thead>
              <tbody>
                {topCounterparties.map((c: TopCounterparty, i: number) => (
                  <tr key={c.counterparty} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4 tabular-nums">{i + 1}</span>
                        <span className="font-medium truncate max-w-[180px]">{c.counterparty}</span>
                      </div>
                    </td>
                    <td className="text-right tabular-nums text-muted-foreground px-3 py-2.5">{c.count}</td>
                    <td className="text-right font-semibold tabular-nums px-5 py-2.5">
                      Ksh {c.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

        {/* Recurring */}
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Recurring Transactions
              </p>
              <span className="text-xs text-muted-foreground">
                Payees with 3+ transactions within ±20% of typical amount
              </span>
            </div>
          </div>

          {recurring.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
              <p className="text-sm">No recurring transactions detected yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Counterparty</th>
                  <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Category</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-3 py-3">Occurrences</th>
                  <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[130px]">Typical Amount</th>
                </tr>
              </thead>
              <tbody>
                {recurring.map((r: RecurringItem) => (
                  <tr key={r.counterparty} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3 font-medium">{r.counterparty}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {r.category ?? <span className="text-rose-400 text-xs">Uncategorized</span>}
                    </td>
                    <td className="text-right tabular-nums px-3 py-3 text-violet-400 font-semibold">
                      {r.count}×
                    </td>
                    <td className="text-right font-semibold tabular-nums px-5 py-3">
                      Ksh {r.typicalAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </>
  );
}
