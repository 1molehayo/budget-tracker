import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { BudgetLineItem, Income, MonthWithDetails, Project, Saving, Tag } from "@/types";
import {
  calculateComputedRemainingBalance,
  calculateProjectProgressPercentage,
  calculateProjectRemainingAmount,
  calculateUsableGeneralSavingsPool,
  deriveProjectLifecycleStatus,
  getMonthRemainingBalance,
  isProjectFundingTargetMet,
  summarizeProjectLifecycle,
  summarizeSavings,
} from "./calculations.ts";

const now = new Date("2026-01-01T00:00:00.000Z");

function tag(code: string, category: Tag["category"]): Tag {
  return {
    id: code,
    userId: "fictional-user",
    code,
    label: code,
    category,
    isSystemTag: true,
    createdAt: now,
    updatedAt: now,
  };
}

function saving(amount: number, destinationType: Saving["destinationType"], code?: string): Saving {
  return {
    id: `${destinationType}-${code ?? "none"}-${amount}`,
    monthId: "month-1",
    label: "Fictional saving",
    amount,
    destinationType,
    createdAt: now,
    updatedAt: now,
    tag: code ? tag(code, "SAVINGS") : null,
    project: destinationType === "PROJECT" ? { id: "project-1", title: "Fictional bicycle", status: "PENDING" } : null,
  };
}

function income(amount: number): Income {
  return {
    id: `income-${amount}`,
    monthId: "month-1",
    label: "Fictional stipend",
    amount,
    tag: tag("SALARY", "INCOME"),
  };
}

function lineItem(amount: number): BudgetLineItem {
  return {
    id: `item-${amount}`,
    monthId: "month-1",
    label: "Fictional groceries",
    amount,
    category: "Food",
  };
}

function month(override: number | null, savings: Saving[]): MonthWithDetails {
  return {
    id: "month-1",
    userId: "fictional-user",
    label: "Fictional January",
    year: 2026,
    month: 1,
    remainingBalanceOverride: override,
    createdAt: now,
    updatedAt: now,
    incomes: [income(100)],
    budgetLineItems: [lineItem(30)],
    savings,
  };
}

function project(status: Project["status"], targetAmount: number, savings: Saving[]): Project {
  return {
    id: "project-1",
    userId: "fictional-user",
    title: "Fictional bicycle",
    targetAmount,
    legacySavedAmount: 999,
    status,
    createdAt: now,
    updatedAt: now,
    savings,
  };
}

describe("savings pool", () => {
  it("excludes AJO contributions and project funding from the usable pool", () => {
    const savings = [
      saving(10, "GENERAL", "OTHER"),
      saving(15, "GENERAL", "AJO_PAYOUT"),
      saving(40, "GENERAL", "AJO_CONTRIBUTION"),
      saving(25, "PROJECT"),
    ];

    const summary = summarizeSavings(savings);

    assert.equal(summary.totalEntered, 90);
    assert.equal(summary.usableGeneralPool, 25);
    assert.equal(summary.excludedGeneralTotal, 40);
    assert.equal(summary.projectLinkedTotal, 25);
    assert.equal(calculateUsableGeneralSavingsPool(savings), 25);
  });
});

describe("monthly balance", () => {
  it("subtracts budget items and every saving from income", () => {
    const savings = [saving(20, "GENERAL", "OTHER")];

    assert.equal(calculateComputedRemainingBalance([income(100)], [lineItem(30)], savings), 50);
  });

  it("uses a remaining-balance override when one is stored", () => {
    const record = month(12, [saving(20, "GENERAL", "OTHER")]);

    assert.equal(getMonthRemainingBalance(record), 12);
    assert.equal(getMonthRemainingBalance({ ...record, remainingBalanceOverride: null }), 50);
  });
});

describe("project funding and lifecycle", () => {
  it("ignores legacy carryover and general savings", () => {
    const funded = project("PENDING", 80, [
      saving(30, "PROJECT"),
      saving(100, "GENERAL", "OTHER"),
    ]);
    const lifecycle = summarizeProjectLifecycle(funded);

    assert.equal(lifecycle.fundedAmount, 30);
    assert.equal(lifecycle.remainingAmount, 50);
    assert.equal(lifecycle.progressPercentage, 38);
    assert.equal(lifecycle.effectiveStatus, "IN_PROGRESS");
    assert.equal(lifecycle.canMarkCompleted, false);
    assert.equal(funded.legacySavedAmount, 999);
  });

  it("derives pending, ready, and paused states", () => {
    assert.equal(deriveProjectLifecycleStatus("PENDING", 80, 0), "PENDING");
    assert.equal(deriveProjectLifecycleStatus("PENDING", 80, 80), "READY");
    assert.equal(deriveProjectLifecycleStatus("PAUSED", 80, 80), "PAUSED");
    assert.equal(calculateProjectRemainingAmount(80, 100), 0);
    assert.equal(calculateProjectProgressPercentage(80, 100), 100);
  });

  it("keeps a completed project only while funding still meets the target", () => {
    assert.equal(isProjectFundingTargetMet(80, 80), true);
    assert.equal(deriveProjectLifecycleStatus("COMPLETED", 80, 80), "COMPLETED");
    assert.equal(deriveProjectLifecycleStatus("COMPLETED", 80, 20), "IN_PROGRESS");
    assert.equal(deriveProjectLifecycleStatus("COMPLETED", 80, 0), "PENDING");
    assert.equal(summarizeProjectLifecycle(project("READY", 80, [saving(80, "PROJECT")])).canMarkCompleted, true);
  });
});
