import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const categoryId = body?.categoryId;

  if (typeof categoryId !== "string" || categoryId.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid 'categoryId'" },
      { status: 400 },
    );
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404 },
    );
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const [updatedTransaction] = await prisma.$transaction([
    prisma.transaction.update({
      where: { id },
      data: { categoryId },
    }),
    prisma.counterpartyRule.upsert({
      where: { counterparty: transaction.counterparty },
      update: { categoryId },
      create: { counterparty: transaction.counterparty, categoryId },
    }),
  ]);

  return NextResponse.json({
    status: "categorized",
    transaction: updatedTransaction,
  });
}
