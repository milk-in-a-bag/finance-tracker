import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    include: { category: true },
    orderBy: { transactionDate: "desc" },
  });

  // ── Top 10 spends ──────────────────────────────────────────────────────
  const topSpends = [...transactions]
    .sort((a, b) => Number(b.amount) - Number(a.amount))
    .slice(0, 10)
    .map((t) => ({
      id: t.id,
      counterparty: t.counterparty,
      amount: Number(t.amount),
      type: t.type,
      category: t.category?.name ?? null,
      transactionDate: t.transactionDate,
    }));

  // ── Top counterparties by total spend ──────────────────────────────────
  const counterpartyMap = new Map<string, { counterparty: string; total: number; count: number }>();
  for (const t of transactions) {
    const existing = counterpartyMap.get(t.counterparty) ?? {
      counterparty: t.counterparty,
      total: 0,
      count: 0,
    };
    existing.total += Number(t.amount);
    existing.count += 1;
    counterpartyMap.set(t.counterparty, existing);
  }
  const topCounterparties = [...counterpartyMap.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);

  // ── Recurring detection ────────────────────────────────────────────────
  // A counterparty is "recurring" if it appears 3+ times with amounts
  // within ±20% of the median for that counterparty.
  const recurring: {
    counterparty: string;
    count: number;
    typicalAmount: number;
    category: string | null;
  }[] = [];

  for (const [counterparty, stats] of counterpartyMap.entries()) {
    if (stats.count < 3) continue;

    const amounts = transactions
      .filter((t) => t.counterparty === counterparty)
      .map((t) => Number(t.amount))
      .sort((a, b) => a - b);

    const median = amounts[Math.floor(amounts.length / 2)];
    const consistent = amounts.every(
      (a) => Math.abs(a - median) / median <= 0.2,
    );

    if (consistent) {
      const sample = transactions.find((t) => t.counterparty === counterparty);
      recurring.push({
        counterparty,
        count: stats.count,
        typicalAmount: median,
        category: sample?.category?.name ?? null,
      });
    }
  }
  recurring.sort((a, b) => b.count - a.count);

  // ── Uncategorized count ────────────────────────────────────────────────
  const uncategorizedCount = transactions.filter((t) => !t.categoryId).length;

  return NextResponse.json({
    topSpends,
    topCounterparties,
    recurring,
    uncategorizedCount,
    totalTransactions: transactions.length,
  });
}
