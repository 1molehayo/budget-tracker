import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readBudgetLineItemAmount } from "./budget-line-item-amount.ts";

describe("budget line item amount", () => {
  it("rejects a negative amount", () => {
    assert.deepEqual(readBudgetLineItemAmount("-1"), {
      error: "Enter a budget amount of zero or more.",
    });
    assert.deepEqual(readBudgetLineItemAmount("-0.01"), {
      error: "Enter a budget amount of zero or more.",
    });
  });

  it("accepts zero and positive amounts", () => {
    assert.deepEqual(readBudgetLineItemAmount("0"), { amount: 0 });
    assert.deepEqual(readBudgetLineItemAmount("0.00"), { amount: 0 });
    assert.deepEqual(readBudgetLineItemAmount("12.50"), { amount: 12.5 });
  });

  it("rejects a blank or invalid amount", () => {
    assert.deepEqual(readBudgetLineItemAmount(""), {
      error: "Enter a budget item description and amount.",
    });
    assert.deepEqual(readBudgetLineItemAmount("   "), {
      error: "Enter a budget item description and amount.",
    });
    assert.deepEqual(readBudgetLineItemAmount("abc"), {
      error: "Enter a budget item description and amount.",
    });
    assert.deepEqual(readBudgetLineItemAmount(null), {
      error: "Enter a budget item description and amount.",
    });
  });
});
