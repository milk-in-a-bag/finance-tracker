import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategorySelector } from "@/components/web/category-slector";
import { PushRegistration } from "@/components/web/push-registration";
import { PeriodSwitcher } from "@/components/web/period-switcher";
import { CategoryBarChart } from "@/components/web/category-bar-chart";
import { SpendingTimeChart } from "@/components/web/spending-time-chart";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

async function getSummary(period: string) {
  const res = await fetch(`${baseUrl}/api/summary?period=${period}`, {
    cache: "no-store",
  });
  return res.json();
}

async function getTransactions() {
  const res = await fetch(`${baseUrl}/api/transactions`, { cache: "no-store" });
  return res.json();
}

async function getCategories() {
  const res = await fetch(`${baseUrl}/api/categories`, { cache: "no-store" });
  return res.json();
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const { period = "month" } = await searchParams;

  const [summary, { transactions }, { categories }] = await Promise.all([
    getSummary(period),
    getTransactions(),
    getCategories(),
  ]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <PushRegistration />

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Finance Dashboard</h1>
        <PeriodSwitcher current={period} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">
            Ksh {summary.overallTotal.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Spending Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <SpendingTimeChart data={summary.timeSeries} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>By Category</CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryBarChart data={summary.byCategory} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Counterparty</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(
                (t: {
                  id: string;
                  transactionDate: string;
                  counterparty: string;
                  type: string;
                  category: { id: string; name: string } | null;
                  amount: string;
                }) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      {new Date(t.transactionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{t.counterparty}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.type}</Badge>
                    </TableCell>
                    <TableCell>
                      <CategorySelector
                        transactionId={t.id}
                        categories={categories}
                        currentCategoryId={t.category?.id}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      Ksh {Number(t.amount).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
