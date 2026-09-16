import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { transactionDate: "desc" },
    include: { category: true },
  });

  return NextResponse.json({ transactions });
}
