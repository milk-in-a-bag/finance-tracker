import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

function toEat(date: Date) {
  return new Date(date.getTime() + EAT_OFFSET_MS);
}

// Computes the UTC instant corresponding to the start of "today" in EAT,
// so period boundaries line up with Nairobi's calendar, not the server's.
function getPeriodStart(period: string): Date | null {
  const nowEat = toEat(new Date());

  if (period === "today") {
    const startEat = Date.UTC(
      nowEat.getUTCFullYear(),
      nowEat.getUTCMonth(),
      nowEat.getUTCDate(),
    );
    return new Date(startEat - EAT_OFFSET_MS);
  }
  if (period === "week") {
    const day = nowEat.getUTCDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const startEat = Date.UTC(
      nowEat.getUTCFullYear(),
      nowEat.getUTCMonth(),
      nowEat.getUTCDate() - diffToMonday,
    );
    return new Date(startEat - EAT_OFFSET_MS);
  }
  if (period === "month") {
    const startEat = Date.UTC(nowEat.getUTCFullYear(), nowEat.getUTCMonth(), 1);
    return new Date(startEat - EAT_OFFSET_MS);
  }
  if (period === "year") {
    const startEat = Date.UTC(nowEat.getUTCFullYear(), 0, 1);
    return new Date(startEat - EAT_OFFSET_MS);
  }
  return null; // "all"
}

// Groups a transaction date into a chart bucket, in EAT wall-clock terms.
function getBucket(
  period: string,
  date: Date,
): { sortKey: string; label: string } {
  const eat = toEat(date);

  if (period === "today") {
    const hour = eat.getUTCHours();
    return {
      sortKey: String(hour).padStart(2, "0"),
      label: eat.toLocaleTimeString("en-US", {
        hour: "numeric",
        timeZone: "UTC",
      }),
    };
  }
  if (period === "year") {
    const month = eat.getUTCMonth();
    return {
      sortKey: String(month).padStart(2, "0"),
      label: eat.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      }),
    };
  }
  // week, month, all -> bucket by day
  const sortKey = `${eat.getUTCFullYear()}-${String(eat.getUTCMonth() + 1).padStart(2, "0")}-${String(eat.getUTCDate()).padStart(2, "0")}`;
  const label = eat.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return { sortKey, label };
}

export async function GET(req: NextRequest) {
  const period = req.nextUrl.searchParams.get("period") ?? "month";
  const start = getPeriodStart(period);

  const transactions = await prisma.transaction.findMany({
    where: start ? { transactionDate: { gte: start } } : {},
    include: { category: true },
  });

  const overallTotal = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );

  const byCategoryMap = new Map<
    string,
    { categoryId: string | null; categoryName: string; total: number }
  >();
  for (const t of transactions) {
    const key = t.categoryId ?? "uncategorized";
    const existing = byCategoryMap.get(key) ?? {
      categoryId: t.categoryId,
      categoryName: t.category?.name ?? "Uncategorized",
      total: 0,
    };
    existing.total += Number(t.amount);
    byCategoryMap.set(key, existing);
  }

  const seriesMap = new Map<string, { label: string; total: number }>();
  for (const t of transactions) {
    const { sortKey, label } = getBucket(period, t.transactionDate);
    const existing = seriesMap.get(sortKey) ?? { label, total: 0 };
    existing.total += Number(t.amount);
    seriesMap.set(sortKey, existing);
  }
  const timeSeries = [...seriesMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  return NextResponse.json({
    overallTotal,
    byCategory: [...byCategoryMap.values()],
    timeSeries,
    period,
  });
}
