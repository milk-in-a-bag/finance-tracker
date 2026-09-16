export function resolveCategoryId(
  rule: { categoryId: string } | null,
): string | null {
  return rule?.categoryId ?? null;
}
