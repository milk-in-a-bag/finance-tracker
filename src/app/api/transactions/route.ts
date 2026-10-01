import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma";

const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

function getPeriodStart(period: string): Date | null {
  const nowEat = new Date(Date.now() + EAT_OFFSET_MS);

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
  return null;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") ?? "all";
  const search = searchParams.get("search")?.trim() ?? "";
  const type = searchParams.get("type") ?? ""; // e.g. "SENT"
  const category = searchParams.get("category") ?? ""; // category id

  const start = getPeriodStart(period);

  const where: Prisma.TransactionWhereInput = {
    ...(start ? { transactionDate: { gte: start } } : {}),
    ...(search
      ? { counterparty: { contains: search, mode: "insensitive" } }
      : {}),
    ...(type
      ? { type: type as Prisma.EnumTransactionTypeFilter["equals"] }
      : {}),
    ...(category === "uncategorized"
      ? { categoryId: null }
      : category
        ? { categoryId: category }
        : {}),
  };

  const transactions = await prisma.transaction.findMany({
    where,
    orderBy: { transactionDate: "desc" },
    include: { category: true },
  });

  return NextResponse.json({ transactions });
}
