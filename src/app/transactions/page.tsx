import { CategorySelector } from "@/components/web/category-selector";
import { TransactionFilters } from "@/components/web/transaction-filters";

type TransactionRow = {
  id: string;
  transactionDate: string;
  counterparty: string;
  type: string;
  category: { id: string; name: string } | null;
  amount: string;
};

type Category = { id: string; name: string };

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

const TYPE_STYLES: Record<string, string> = {
  SENT:     "bg-rose-500/15 text-rose-400 border-rose-500/20",
  RECEIVED: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  PAYBILL:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
  AIRTIME:  "bg-violet-500/15 text-violet-400 border-violet-500/20",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    type?: string;
    category?: string;
  }>;
}) {
  const { search = "", type = "", category = "" } = await searchParams;

  const params = new URLSearchParams({ search, type, category });

  const [txRes, catRes] = await Promise.all([
    fetch(`${baseUrl}/api/transactions?${params}`, { cache: "no-store" }),
    fetch(`${baseUrl}/api/categories`, { cache: "no-store" }),
  ]);

  const { transactions }: { transactions: TransactionRow[] } = await txRes.json();
  const { categories }: { categories: Category[] } = await catRes.json();

  return (
    <>
      {/* Top bar */}
      <header className="h-14 flex items-center justify-between px-6 border-b border-border/60 bg-card/40 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-base font-semibold">Transactions</h1>
        <span className="text-xs text-muted-foreground">
          {transactions.length} record{transactions.length !== 1 ? "s" : ""}
        </span>
      </header>

      <main className="flex-1 px-6 py-6 space-y-4">
        {/* Filters */}
        <TransactionFilters categories={categories} />

        {/* Table */}
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10 opacity-40">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
              </svg>
              <p className="text-sm">No transactions match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 w-[110px]">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3">Counterparty</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 w-[110px]">Type</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-3 py-3 w-[160px]">Category</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3 w-[120px]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                      <td className="text-muted-foreground tabular-nums px-5 py-3">
                        {new Date(t.transactionDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </td>
                      <td className="font-medium px-3 py-3 max-w-[240px] truncate">
                        {t.counterparty}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${TYPE_STYLES[t.type] ?? "bg-muted text-muted-foreground border-border"}`}>
                          {t.type}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <CategorySelector
                          transactionId={t.id}
                          categories={categories}
                          currentCategoryId={t.category?.id}
                        />
                      </td>
                      <td className="text-right font-semibold tabular-nums px-5 py-3">
                        Ksh {Number(t.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
