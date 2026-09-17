import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@/generated/prisma/client";
import { parseMpesaSms } from "@/lib/mpesa-parser";
import { resolveCategoryId } from "@/lib/categorize";
import webpush from "web-push";

const prisma = new PrismaClient();

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

async function sendPushToAll(title: string, body: string) {
  const subscriptions = await prisma.pushSubscription.findMany();

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify({ title, body }),
        );
      } catch (err) {
        // 410 Gone / 404 means this subscription is no longer valid (user cleared browser data, etc.)
        if (
          err instanceof Error &&
          "statusCode" in err &&
          (err.statusCode === 410 || err.statusCode === 404)
        ) {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        } else {
          console.error("Push send failed:", err);
        }
      }
    }),
  );
}

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
    const rule = await prisma.counterpartyRule.findUnique({
      where: { counterparty: result.data.counterparty },
    });

    const transaction = await prisma.transaction.create({
      data: {
        mpesaCode: result.data.mpesaCode,
        amount: result.data.amount,
        type: result.data.type,
        counterparty: result.data.counterparty,
        account: result.data.account,
        transactionDate: result.data.transactionDate,
        rawSms: message,
        categoryId: rule?.categoryId ?? null,
      },
    });

    await sendPushToAll(
      "New Transaction",
      `Ksh ${result.data.amount} to ${result.data.counterparty}`,
    );

    return NextResponse.json(
      { status: "parsed", id: transaction.id, autoCategorized: !!rule },
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
