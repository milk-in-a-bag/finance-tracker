import { parseMpesaSms } from "../src/lib/mpesa-parser";

const samples = [
  "UHJAF3CUJC Confirmed. Ksh100.00 sent to Lameck  Mogusu 0717561715 on 19/8/26 at 12:43 PM. New M-PESA balance is Ksh95.40. Transaction cost, Ksh0.00. Amount you can transact within the day is 499,597.00. Download My OneApp on https://saf.cx/lPKcC",

  "UHJAF3ETQ9 Confirmed. Ksh25.00 sent to KPLC PREPAID for account 54402611112 on 19/8/26 at 7:53 PM New M-PESA balance is Ksh0.00. Transaction cost, Ksh0.00.Amount you can transact within the day is 499,317.00. Download My OneApp on https://saf.cx/kWQpy",

  "UFAAF7B8CP Confirmed.on 10/6/26 at 3:16 PMWithdraw Ksh300.00 from 379207 - Christmond Invest HK Shop Cross Rd New M-PESA balance is Ksh2,514.62. Transaction cost, Ksh29.00. Amount you can transact within the day is 499,590.00. Get a Lipa Na M-PESA Till online: https://m-pesaforbusiness.co.ke/",

  "UHMAF3QI42 confirmed.You bought Ksh50.00 of airtime on 22/8/26 at 3:23 PM.New M-PESA balance is Ksh1,819.55. Transaction cost, Ksh0.00. Amount you can transact within the day is 489,300.00. Download My OneApp on https://saf.cx/3wAmy",

  "UHPAF432Q5 Confirmed. Ksh777.39 sent to M-PESA CARD for account OPENAI *CHATGPT SUBSCR   +14158799686 US on 25/8/26 at 4:50 PM New M-PESA balance is Ksh242.16. Transaction cost, Ksh0.00.Amount you can transact within the day is 499,102.61. Download My OneApp on https://saf.cx/kWQpy",

  "UHMAF3QJK6 Confirmed. Ksh10,650.00 sent to Co-operative Bank Collection Account for account 1753950# A25 on 22/8/26 at 3:22 PM New M-PESA balance is Ksh1,869.55. Transaction cost, Ksh57.00.Amount you can transact within the day is 489,350.00. Download My OneApp on https://saf.cx/kWQpy",

  // A "received money" message — should be IGNORED, not flagged for review
  "QFT8XYZ123 Confirmed. You have received Ksh500.00 from JOHN DOE 0712345678 on 19/8/26 at 1:00 PM. New M-PESA balance is Ksh595.40.",

  // A balance-inquiry style message — should also be IGNORED
  "Your M-PESA balance was Ksh595.40 on 19/8/26 at 3:00 PM.",
];

for (const sms of samples) {
  const result = parseMpesaSms(sms);

  if (result.status === "parsed") {
    console.log("✅ PARSED\n", result.data, "\n");
  } else if (result.status === "ignored") {
    console.log(
      "⏭️  IGNORED (not an expense we track)\n",
      sms.slice(0, 60) + "...",
      "\n",
    );
  } else {
    console.log(
      "⚠️  UNPARSED (looked like an expense, needs review)\n",
      sms.slice(0, 60) + "...",
      "\n",
    );
  }
}
