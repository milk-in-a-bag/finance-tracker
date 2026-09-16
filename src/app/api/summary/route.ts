import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const totals = await prisma.transaction.groupBy({
    by: ["categoryId"],
    _sum: { amount: true },
  });

  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const byCategory = totals.map((t) => ({
    categoryId: t.categoryId,
    categoryName: t.categoryId
      ? (categoryMap.get(t.categoryId) ?? "Unknown")
      : "Uncategorized",
    total: t._sum.amount,
  }));

  const overallTotal = totals.reduce(
    (sum, t) => sum + Number(t._sum.amount ?? 0),
    0,
  );

  return NextResponse.json({ overallTotal, byCategory });
}
