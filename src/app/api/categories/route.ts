import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();

  const trimmed = name?.trim();
  if (!trimmed) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    const category = await prisma.category.create({
      data: { name: trimmed, isSystem: false },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch {
    // Unique constraint violation
    return NextResponse.json(
      { error: "A category with that name already exists" },
      { status: 409 },
    );
  }
}
