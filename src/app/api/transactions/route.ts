import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { transactionDate: "desc" },
    include: { category: true },
  });

  return NextResponse.json({ transactions });
}
