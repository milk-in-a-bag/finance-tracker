import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";
import { getPeriodStart } from "@/lib/period";

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
