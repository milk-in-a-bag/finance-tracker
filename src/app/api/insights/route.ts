import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPeriodStart } from "@/lib/period";

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

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "all";
  const start = getPeriodStart(period);

  try {
    const [transactions, allTransactions, unparsedMessages] = await Promise.all(
      [
        // Period-scoped transactions (for most insights)
        prisma.transaction.findMany({
          where: start ? { transactionDate: { gte: start } } : {},
          include: { category: true },
          orderBy: { transactionDate: "desc" },
        }),
        // All-time transactions (for recurring detection)
        prisma.transaction.findMany({
          include: { category: true },
          orderBy: { transactionDate: "asc" },
        }),
        prisma.unparsedMessage.findMany({
          orderBy: { receivedAt: "desc" },
        }),
      ],
    );

    // ── First transaction date (for "since" label) ─────────────────────────
    const firstTransactionDate = allTransactions[0]?.transactionDate ?? null;

    // ── Top 3 spends ───────────────────────────────────────────────────────
    const topSpends = [...transactions]
      .sort((a, b) => Number(b.amount) - Number(a.amount))
      .slice(0, 3)
      .map((t) => ({
        id: t.id,
        counterparty: t.counterparty,
        amount: Number(t.amount),
        type: t.type,
        category: t.category?.name ?? null,
        transactionDate: t.transactionDate,
      }));

    // ── Counterparty aggregation (period-scoped) ───────────────────────────
    const counterpartyMap = new Map<
      string,
      {
        counterparty: string;
        total: number;
        count: number;
        category: string | null;
      }
    >();
    for (const t of transactions) {
      const e = counterpartyMap.get(t.counterparty) ?? {
        counterparty: t.counterparty,
        total: 0,
        count: 0,
        category: t.category?.name ?? null,
      };
      e.total += Number(t.amount);
      e.count += 1;
      counterpartyMap.set(t.counterparty, e);
    }

    // ── Top 3 counterparties by total spend ────────────────────────────────
    const topCounterparties = [...counterpartyMap.values()]
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);

    // ── Concentration: top-3 payees share of period spend ─────────────────
    const overallTotal = transactions.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const sortedCounterparties = [...counterpartyMap.values()].sort(
      (a, b) => b.total - a.total,
    );
    const top3Total = sortedCounterparties
      .slice(0, 3)
      .reduce((sum, c) => sum + c.total, 0);
    const top3Names = sortedCounterparties
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

    // ── Busiest day of the week (always all-time, EAT) ────────────────────
    const dayCount = new Array(7).fill(0) as number[];
    const dayTotal = new Array(7).fill(0) as number[];
    for (const t of allTransactions) {
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

    // ── Avg transaction per category (period-scoped) ───────────────────────
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

    // ── Recurring payees (2+ transactions in period) ──────────────────────
    const recurringPayees = [...counterpartyMap.values()]
      .filter((c) => c.count >= 2)
      .sort((a, b) => b.count - a.count)
      .map((c) => ({
        counterparty: c.counterparty,
        count: c.count,
        total: c.total,
        category: c.category,
      }));

    // ── Uncategorized count + total (period-scoped) ────────────────────────
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
      recurringPayees,
      uncategorizedCount,
      uncategorizedTotal,
      totalTransactions: transactions.length,
      firstTransactionDate,
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
