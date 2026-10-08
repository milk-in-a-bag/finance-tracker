const EAT_OFFSET_MS = 3 * 60 * 60 * 1000;

function toEat(date: Date) {
  return new Date(date.getTime() + EAT_OFFSET_MS);
}

/**
 * Returns the UTC Date corresponding to the start of the given period in EAT,
 * or null for "all" (no filter).
 */
export function getPeriodStart(period: string): Date | null {
  const nowEat = toEat(new Date());

  if (period === "today") {
    const startEat = Date.UTC(
      nowEat.getUTCFullYear(),
      nowEat.getUTCMonth(),
      nowEat.getUTCDate(),
    );
    return new Date(startEat - EAT_OFFSET_MS);
  }
  if (period === "week") {
    const day = nowEat.getUTCDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    const startEat = Date.UTC(
      nowEat.getUTCFullYear(),
      nowEat.getUTCMonth(),
      nowEat.getUTCDate() - diffToMonday,
    );
    return new Date(startEat - EAT_OFFSET_MS);
  }
  if (period === "month") {
    const startEat = Date.UTC(nowEat.getUTCFullYear(), nowEat.getUTCMonth(), 1);
    return new Date(startEat - EAT_OFFSET_MS);
  }
  if (period === "year") {
    const startEat = Date.UTC(nowEat.getUTCFullYear(), 0, 1);
    return new Date(startEat - EAT_OFFSET_MS);
  }
  return null; // all time
}
