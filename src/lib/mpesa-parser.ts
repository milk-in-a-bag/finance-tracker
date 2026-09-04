// src/lib/mpesa-parser.ts

export type ParsedMpesaTransaction = {
  mpesaCode: string;
  amount: number;
  type: "SENT" | "PAYBILL" | "WITHDRAWAL" | "AIRTIME";
  counterparty: string;
  account?: string;
  transactionDate: Date;
};

export type ParseResult =
  | { status: "parsed"; data: ParsedMpesaTransaction }
  | { status: "ignored" } // not an expense we track — e.g. received money, balance check
  | { status: "unparsed" }; // looked like an expense, but didn't match our patterns — needs review

const CODE_RE = /^(\S+)\s+confirmed/i;

// Markers that indicate this SMS is one of the four expense types we handle.
// If NONE of these appear, we ignore the message entirely rather than flagging it for review.
const EXPENSE_MARKERS = [
  /sent to/i,
  /withdraw/i,
  /bought\s+ksh[\d,]+\.\d{2}\s+of\s+airtime/i,
];

function looksLikeExpense(text: string): boolean {
  return EXPENSE_MARKERS.some((re) => re.test(text));
}

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/,/g, ""));
}

function parseDateTime(dateStr: string, timeStr: string): Date {
  const [day, month, yearShort] = dateStr.split("/").map(Number);
  const year = 2000 + yearShort;

  const [, hourStr, minStr, meridiem] = timeStr.match(
    /(\d{1,2}):(\d{2})\s*([AP]M)/i,
  )!;
  let hour = parseInt(hourStr, 10);
  if (meridiem.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (meridiem.toUpperCase() === "AM" && hour === 12) hour = 0;

  return new Date(year, month - 1, day, hour, parseInt(minStr, 10));
}

export function parseMpesaSms(text: string): ParseResult {
  if (!looksLikeExpense(text)) {
    return { status: "ignored" };
  }

  const codeMatch = text.match(CODE_RE);
  if (!codeMatch) return { status: "unparsed" };
  const mpesaCode = codeMatch[1];

  const withdrawalMatch = text.match(
    /on (\d{1,2}\/\d{1,2}\/\d{2}) at (\d{1,2}:\d{2}\s?[AP]M).*?Withdraw Ksh([\d,]+\.\d{2}) from (.+?) New M-PESA balance/i,
  );
  if (withdrawalMatch) {
    const [, date, time, amount, agent] = withdrawalMatch;
    return {
      status: "parsed",
      data: {
        mpesaCode,
        amount: parseAmount(amount),
        type: "WITHDRAWAL",
        counterparty: agent.trim(),
        transactionDate: parseDateTime(date, time),
      },
    };
  }

  const airtimeMatch = text.match(
    /bought Ksh([\d,]+\.\d{2}) of airtime on (\d{1,2}\/\d{1,2}\/\d{2}) at (\d{1,2}:\d{2}\s?[AP]M)/i,
  );
  if (airtimeMatch) {
    const [, amount, date, time] = airtimeMatch;
    return {
      status: "parsed",
      data: {
        mpesaCode,
        amount: parseAmount(amount),
        type: "AIRTIME",
        counterparty: "Safaricom Airtime",
        transactionDate: parseDateTime(date, time),
      },
    };
  }

  const paybillMatch = text.match(
    /Ksh([\d,]+\.\d{2}) sent to (.+?) for account (.+?) on (\d{1,2}\/\d{1,2}\/\d{2}) at (\d{1,2}:\d{2}\s?[AP]M)/i,
  );
  if (paybillMatch) {
    const [, amount, counterparty, account, date, time] = paybillMatch;
    return {
      status: "parsed",
      data: {
        mpesaCode,
        amount: parseAmount(amount),
        type: "PAYBILL",
        counterparty: counterparty.trim(),
        account: account.trim(),
        transactionDate: parseDateTime(date, time),
      },
    };
  }

  const sentMatch = text.match(
    /Ksh([\d,]+\.\d{2}) sent to (.+?) on (\d{1,2}\/\d{1,2}\/\d{2}) at (\d{1,2}:\d{2}\s?[AP]M)/i,
  );
  if (sentMatch) {
    const [, amount, counterparty, date, time] = sentMatch;
    return {
      status: "parsed",
      data: {
        mpesaCode,
        amount: parseAmount(amount),
        type: "SENT",
        counterparty: counterparty.replace(/\s+/g, " ").trim(),
        transactionDate: parseDateTime(date, time),
      },
    };
  }

  return { status: "unparsed" };
}
