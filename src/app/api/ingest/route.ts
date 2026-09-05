import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "../../../generated/prisma/client";
import { parseMpesaSms } from "@/lib/mpesa-parser";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-webhook-secret");
  if (secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const message = body?.message;

  if (typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing or invalid 'message' field" },
      { status: 400 },
    );
  }

  const result = parseMpesaSms(message);

  if (result.status === "ignored") {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  if (result.status === "unparsed") {
    await prisma.unparsedMessage.create({
      data: { rawSms: message },
    });
    return NextResponse.json({ status: "unparsed" }, { status: 200 });
  }

  // result.status === "parsed"
  try {
    const transaction = await prisma.transaction.create({
      data: {
        mpesaCode: result.data.mpesaCode,
        amount: result.data.amount,
        type: result.data.type,
        counterparty: result.data.counterparty,
        account: result.data.account,
        transactionDate: result.data.transactionDate,
        rawSms: message,
      },
    });
    return NextResponse.json(
      { status: "parsed", id: transaction.id },
      { status: 201 },
    );
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002" // unique constraint violation
    ) {
      // Already recorded — MacroDroid retried a message we've already saved.
      return NextResponse.json({ status: "duplicate" }, { status: 200 });
    }
    console.error("Ingestion error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
