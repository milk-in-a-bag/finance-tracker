import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

export async function GET() {
  try {
    const [transactions, unparsedMessages] = await Promise.all([
      prisma.transaction.findMany({
        include: { category: true },
        orderBy: { transactionDate: "desc" },
      }),
      prisma.unparsedMessage.findMany({
        orderBy: { receivedAt: "desc" },
      }),
    ]);

    // ── Top 5 spends ───────────────────────────────────────────────────────
    const topSpends = [...transactions]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        counterparty: t.counterparty,
        amount: Number(t.amount),
        type: t.type,
        category: t.category?.name ?? null,
        transactionDate: t.transactionDate,
      }));

    // ── Counterparty aggregation (used by multiple insights) ───────────────
    const counterpartyMap = new Map<
      string,
      { counterparty: string; total: number; count: number }
    >();
    for (const t of transactions) {
      const e = counterpartyMap.get(t.counterparty) ?? {
        counterparty: t.counterparty,
        total: 0,
        count: 0,
      };
      e.total += Number(t.amount);
      e.count += 1;
      counterpartyMap.set(t.counterparty, e);
    }

    // ── Top 5 counterparties by total spend ────────────────────────────────
    const topCounterparties = [...counterpartyMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // ── Concentration: top-3 payees share of overall spend ────────────────
    const overallTotal = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const top3Total = [...counterpartyMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .reduce((sum, c) => sum + c.total, 0);
    const top3Names = [...counterpartyMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3)
      .map((c) => c.counterparty);
    const concentrationPct =
      overallTotal > 0 ? Math.round((top3Total / overallTotal) * 100) : 0;

    // ── Spend by transaction type ──────────────────────────────────────────
    const typeMap = new Map<
      string,
      { type: string; total: number; count: number }
    >();
    for (const t of transactions) {
      const e = typeMap.get(t.type) ?? { type: t.type, total: 0, count: 0 };
      e.total += Number(t.amount);
      e.count += 1;
      typeMap.set(t.type, e);
    }
    const spendByType = [...typeMap.values()].sort((a, b) => b.total - a.total);

    // ── Busiest day of the week (by transaction count, EAT) ───────────────
    const dayCount = new Array(7).fill(0) as number[];
    const dayTotal = new Array(7).fill(0) as number[];
    for (const t of transactions) {
      const eat = new Date(
        new Date(t.transactionDate).getTime() + EAT_OFFSET_MS,
      );
      const day = eat.getUTCDay();
      dayCount[day]++;
      dayTotal[day] += Number(t.amount);
    }
    const busiestDay = DAYS.map((name, i) => ({
      day: name,
      count: dayCount[i],
      total: dayTotal[i],
    }));

    // ── Avg transaction per category ──────────────────────────────────────
    const catMap = new Map<
      string,
      { category: string; total: number; count: number }
    >();
    for (const t of transactions) {
      const key = t.category?.name ?? "Uncategorized";
      const e = catMap.get(key) ?? { category: key, total: 0, count: 0 };
      e.total += Number(t.amount);
      e.count += 1;
      catMap.set(key, e);
    }
    const avgByCategory = [...catMap.values()]
      .map((c) => ({ ...c, avg: c.total / c.count }))
      .sort((a, b) => b.total - a.total);

    // ── Recurring detection ────────────────────────────────────────────────
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
        const sample = transactions.find(
          (t) => t.counterparty === counterparty,
        );
        recurring.push({
          counterparty,
          count: stats.count,
          typicalAmount: median,
          category: sample?.category?.name ?? null,
        });
      }
    }
    recurring.sort((a, b) => b.count - a.count);

    // ── Uncategorized count + total ───────────────────────────────────────
    const uncategorized = transactions.filter((t) => !t.categoryId);
    const uncategorizedCount = uncategorized.length;
    const uncategorizedTotal = uncategorized.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );

    return NextResponse.json({
      topSpends,
      topCounterparties,
      concentrationPct,
      top3Names,
      spendByType,
      busiestDay,
      avgByCategory,
      recurring,
      uncategorizedCount,
      uncategorizedTotal,
      totalTransactions: transactions.length,
      unparsedMessages: unparsedMessages.map((m) => ({
        id: m.id,
        rawSms: m.rawSms,
        receivedAt: m.receivedAt,
        resolved: m.resolved,
      })),
    });
  } catch (err) {
    console.error("[insights]", err);
    return NextResponse.json(
      { error: "Failed to compute insights" },
      { status: 500 },
    );
  }
}
