export { cn } from "cn";

/**
 * Strips trailing Kenyan phone numbers from M-Pesa counterparty strings.
 * e.g. "JANE MAYODI 0728176756" → "JANE MAYODI"
 *      "Safaricom Airtime"      → "Safaricom Airtime"  (no change)
 */
export function formatCounterparty(name: string): string {
  return name.replace(/\s+(?:\+?254|0)\d{9}$/, "").trim();
}
