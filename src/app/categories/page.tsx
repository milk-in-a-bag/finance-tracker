const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

type Category = {
  id: string;
  name: string;
  isSystem: boolean;
  createdAt: string;
  _count?: { transactions: number; counterpartyRules: number };
};

async function getCategoriesWithCounts() {
  // Fetch categories and enrich with transaction + rule counts
  const res = await fetch(`${baseUrl}/api/categories/stats`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function CategoriesPage() {
  const { categories }: { categories: Category[] } =
    await getCategoriesWithCounts();

  const total = categories.reduce(
    (sum, c) => sum + (c._count?.transactions ?? 0),
    0,
  );

  return (
    <>
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-base font-semibold">Categories</h1>
        <span className="text-xs text-muted-foreground">
          {categories.length} categories
        </span>
      </header>

      <main className="flex-1 px-6 py-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Total Categories</p>
            <p className="text-2xl font-bold text-primary">{categories.length}</p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Auto-assign Rules</p>
            <p className="text-2xl font-bold text-teal-400">
              {categories.reduce((sum, c) => sum + (c._count?.counterpartyRules ?? 0), 0)}
            </p>
          </div>
          <div className="bg-card border border-border/60 rounded-xl px-5 py-4">
            <p className="text-xs text-muted-foreground mb-1">Categorized Txns</p>
            <p className="text-2xl font-bold text-amber-400">{total}</p>
          </div>
        </div>

        {/* Category list */}
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border/60">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              All Categories
            </p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/60">
                <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Name</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Transactions</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Auto-rules</th>
                <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">% of total</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => {
                const txCount = c._count?.transactions ?? 0;
                const ruleCount = c._count?.counterpartyRules ?? 0;
                const pct = total > 0 ? (txCount / total) * 100 : 0;
                return (
                  <tr
                    key={c.id}
                    className="border-b border-border/40 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{c.name}</span>
                        {c.isSystem && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                            system
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-right tabular-nums px-5 py-3 text-muted-foreground">
                      {txCount}
                    </td>
                    <td className="text-right tabular-nums px-5 py-3">
                      {ruleCount > 0 ? (
                        <span className="text-teal-400">{ruleCount}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground tabular-nums w-10 text-right">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
