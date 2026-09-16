import { describe, it, expect } from "vitest";
import { resolveCategoryId } from "./categorize";

describe("resolveCategoryId", () => {
  it("returns the rule's categoryId when a matching rule exists", () => {
    expect(resolveCategoryId({ categoryId: "cat_food_123" })).toBe(
      "cat_food_123",
    );
  });

  it("returns null when no rule exists", () => {
    expect(resolveCategoryId(null)).toBeNull();
  });
});
