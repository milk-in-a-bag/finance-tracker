import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getPeriodStart } from "@/lib/period";

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

function toEat(date: Date) {
  return new Date(date.getTime() + EAT_OFFSET_MS);
}

// Returns the [start, end) of the previous equivalent period in UTC.
function getPreviousPeriodRange(
  period: string,
): { start: Date; end: Date } | null {
  const nowEat = toEat(new Date());

  if (period === "today") {
    const todayStartEat = Date.UTC(
      nowEat.getUTCFullYear(),
      nowEat.getUTCMonth(),
      nowEat.getUTCDate(),
    );
    const end = new Date(todayStartEat - EAT_OFFSET_MS);
    const start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
    return { start, end };
  }
  if (period === "week") {
    const day = nowEat.getUTCDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const thisWeekStartEat = Date.UTC(
      nowEat.getUTCFullYear(),
      nowEat.getUTCMonth(),
      nowEat.getUTCDate() - diffToMonday,
    );
    const end = new Date(thisWeekStartEat - EAT_OFFSET_MS);
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    return { start, end };
  }
  if (period === "month") {
    // Previous calendar month
    const prevMonthEat = new Date(
      Date.UTC(nowEat.getUTCFullYear(), nowEat.getUTCMonth() - 1, 1),
    );
    const start = new Date(prevMonthEat.getTime() - EAT_OFFSET_MS);
    const end = new Date(
      Date.UTC(nowEat.getUTCFullYear(), nowEat.getUTCMonth(), 1) -
        EAT_OFFSET_MS,
    );
    return { start, end };
  }
  if (period === "year") {
    const start = new Date(
      Date.UTC(nowEat.getUTCFullYear() - 1, 0, 1) - EAT_OFFSET_MS,
    );
    const end = new Date(
      Date.UTC(nowEat.getUTCFullYear(), 0, 1) - EAT_OFFSET_MS,
    );
    return { start, end };
  }
  return null;
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
  const prevRange = getPreviousPeriodRange(period);

  const [transactions, prevTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: start ? { transactionDate: { gte: start } } : {},
      include: { category: true },
    }),
    prevRange
      ? prisma.transaction.findMany({
          where: {
            transactionDate: { gte: prevRange.start, lt: prevRange.end },
          },
          select: { amount: true },
        })
      : Promise.resolve([]),
  ]);

  const overallTotal = transactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );

  const previousTotal = prevTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0,
  );
  const previousCount = prevTransactions.length;
  const previousAvg = previousCount > 0 ? previousTotal / previousCount : 0;

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

  // Fill in zero-value buckets for every expected slot in the period so the
  // chart doesn't skip days/hours/months where nothing was spent.
  const nowEat = toEat(new Date());
  if (period === "today") {
    const currentHour = nowEat.getUTCHours();
    for (let h = 0; h <= currentHour; h++) {
      const sortKey = String(h).padStart(2, "0");
      if (!seriesMap.has(sortKey)) {
        const fakeDate = new Date(
          Date.UTC(
            nowEat.getUTCFullYear(),
            nowEat.getUTCMonth(),
            nowEat.getUTCDate(),
            h,
          ),
        );
        const label = fakeDate.toLocaleTimeString("en-US", {
          hour: "numeric",
          timeZone: "UTC",
        });
        seriesMap.set(sortKey, { label, total: 0 });
      }
    }
  } else if (period === "week" || period === "month" || period === "all") {
    if (start) {
      const cursor = new Date(toEat(start).setUTCHours(0, 0, 0, 0));
      const endEat = toEat(new Date());
      while (cursor <= endEat) {
        const sortKey = `${cursor.getUTCFullYear()}-${String(cursor.getUTCMonth() + 1).padStart(2, "0")}-${String(cursor.getUTCDate()).padStart(2, "0")}`;
        if (!seriesMap.has(sortKey)) {
          const label = cursor.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });
          seriesMap.set(sortKey, { label, total: 0 });
        }
        cursor.setUTCDate(cursor.getUTCDate() + 1);
      }
    }
  } else if (period === "year") {
    for (let m = 0; m <= nowEat.getUTCMonth(); m++) {
      const sortKey = String(m).padStart(2, "0");
      if (!seriesMap.has(sortKey)) {
        const fakeDate = new Date(Date.UTC(nowEat.getUTCFullYear(), m, 1));
        const label = fakeDate.toLocaleDateString("en-US", {
          month: "short",
          timeZone: "UTC",
        });
        seriesMap.set(sortKey, { label, total: 0 });
      }
    }
  }

  const timeSeries = [...seriesMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v);

  return NextResponse.json({
    overallTotal,
    previousTotal,
    previousCount,
    previousAvg,
    byCategory: [...byCategoryMap.values()],
    timeSeries,
    period,
  });
}
