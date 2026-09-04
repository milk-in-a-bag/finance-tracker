import { describe, it, expect } from "vitest";
import { parseMpesaSms } from "./mpesa-parser";

describe("parseMpesaSms", () => {
  it("parses a 'sent to person' message", () => {
    const result = parseMpesaSms(
      "UHJAF3CUJC Confirmed. Ksh100.00 sent to Lameck  Mogusu 0717561715 on 19/8/26 at 12:43 PM. New M-PESA balance is Ksh95.40. Transaction cost, Ksh0.00. Amount you can transact within the day is 499,597.00. Download My OneApp on https://saf.cx/lPKcC",
    );

    expect(result.status).toBe("parsed");
    if (result.status !== "parsed") return; // narrows the type for the checks below

    expect(result.data.mpesaCode).toBe("UHJAF3CUJC");
    expect(result.data.amount).toBe(100);
    expect(result.data.type).toBe("SENT");
    expect(result.data.counterparty).toBe("Lameck Mogusu 0717561715");
    expect(result.data.account).toBeUndefined();
    expect(result.data.transactionDate.toISOString()).toBe(
      "2026-08-19T09:43:00.000Z",
    );
  });

  it("parses a paybill message with a plain account number", () => {
    const result = parseMpesaSms(
      "UHJAF3ETQ9 Confirmed. Ksh25.00 sent to KPLC PREPAID for account 54402611112 on 19/8/26 at 7:53 PM New M-PESA balance is Ksh0.00. Transaction cost, Ksh0.00.Amount you can transact within the day is 499,317.00. Download My OneApp on https://saf.cx/kWQpy",
    );

    expect(result.status).toBe("parsed");
    if (result.status !== "parsed") return;

    expect(result.data.amount).toBe(25);
    expect(result.data.type).toBe("PAYBILL");
    expect(result.data.counterparty).toBe("KPLC PREPAID");
    expect(result.data.account).toBe("54402611112");
  });

  it("parses a paybill message with a messy subscription-style account field", () => {
    const result = parseMpesaSms(
      "UHPAF432Q5 Confirmed. Ksh777.39 sent to M-PESA CARD for account OPENAI *CHATGPT SUBSCR   +14158799686 US on 25/8/26 at 4:50 PM New M-PESA balance is Ksh242.16. Transaction cost, Ksh0.00.Amount you can transact within the day is 499,102.61. Download My OneApp on https://saf.cx/kWQpy",
    );

    expect(result.status).toBe("parsed");
    if (result.status !== "parsed") return;

    expect(result.data.amount).toBe(777.39);
    expect(result.data.counterparty).toBe("M-PESA CARD");
    expect(result.data.account).toBe(
      "OPENAI *CHATGPT SUBSCR   +14158799686 US",
    );
  });

  it("parses a paybill amount containing a comma", () => {
    const result = parseMpesaSms(
      "UHMAF3QJK6 Confirmed. Ksh10,650.00 sent to Co-operative Bank Collection Account for account 1753950# A25 on 22/8/26 at 3:22 PM New M-PESA balance is Ksh1,869.55. Transaction cost, Ksh57.00.Amount you can transact within the day is 489,350.00. Download My OneApp on https://saf.cx/kWQpy",
    );

    expect(result.status).toBe("parsed");
    if (result.status !== "parsed") return;

    expect(result.data.amount).toBe(10650);
    expect(result.data.account).toBe("1753950# A25");
  });

  it("parses a withdrawal, despite its reordered date-before-amount structure", () => {
    const result = parseMpesaSms(
      "UFAAF7B8CP Confirmed.on 10/6/26 at 3:16 PMWithdraw Ksh300.00 from 379207 - Christmond Invest HK Shop Cross Rd New M-PESA balance is Ksh2,514.62. Transaction cost, Ksh29.00. Amount you can transact within the day is 499,590.00. Get a Lipa Na M-PESA Till online: https://m-pesaforbusiness.co.ke/",
    );

    expect(result.status).toBe("parsed");
    if (result.status !== "parsed") return;

    expect(result.data.amount).toBe(300);
    expect(result.data.type).toBe("WITHDRAWAL");
    expect(result.data.counterparty).toBe(
      "379207 - Christmond Invest HK Shop Cross Rd",
    );
  });

  it("parses an airtime purchase despite lowercase 'confirmed.'", () => {
    const result = parseMpesaSms(
      "UHMAF3QI42 confirmed.You bought Ksh50.00 of airtime on 22/8/26 at 3:23 PM.New M-PESA balance is Ksh1,819.55. Transaction cost, Ksh0.00. Amount you can transact within the day is 489,300.00. Download My OneApp on https://saf.cx/3wAmy",
    );

    expect(result.status).toBe("parsed");
    if (result.status !== "parsed") return;

    expect(result.data.amount).toBe(50);
    expect(result.data.type).toBe("AIRTIME");
    expect(result.data.counterparty).toBe("Safaricom Airtime");
  });

  it("ignores a 'received money' message rather than flagging it for review", () => {
    const result = parseMpesaSms(
      "QFT8XYZ123 Confirmed. You have received Ksh500.00 from JOHN DOE 0712345678 on 19/8/26 at 1:00 PM. New M-PESA balance is Ksh595.40.",
    );

    expect(result.status).toBe("ignored");
  });

  it("ignores a balance-inquiry message", () => {
    const result = parseMpesaSms(
      "Your M-PESA balance was Ksh595.40 on 19/8/26 at 3:00 PM.",
    );

    expect(result.status).toBe("ignored");
  });

  it("marks an expense-like message as unparsed if it doesn't match any known pattern", () => {
    const result = parseMpesaSms(
      "XYZ999 Confirmed. Ksh50.00 sent to Someone in a format we've never seen before and cannot parse.",
    );

    // This looks like an expense ("sent to") but our regex won't match this made-up wording,
    // so it should land in "unparsed" for manual review — not silently ignored.
    expect(result.status).toBe("unparsed");
  });
});
