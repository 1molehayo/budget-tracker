import type { MockOcrResult } from "@/types";

const MOCK_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const EXPENSE_CATEGORIES = [
  "Housing", "Food", "Transport", "Utilities", "Healthcare",
  "Entertainment", "Clothing", "Education", "Personal Care", "Miscellaneous",
];

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

export function runMockOcr(fileName?: string): MockOcrResult {
  const now = new Date();
  const monthName = MOCK_MONTHS[now.getMonth()];
  const year = now.getFullYear();

  const primarySalary = randomBetween(3500, 6000);
  const hasSideIncome = Math.random() > 0.5;

  const incomes = [
    { label: "Primary Salary", amount: primarySalary },
    ...(hasSideIncome
      ? [{ label: "Freelance Income", amount: randomBetween(200, 1200) }]
      : []),
  ];

  const expenses = [
    { label: "Rent / Mortgage", amount: randomBetween(900, 1800), category: "Housing" },
    { label: "Groceries", amount: randomBetween(200, 500), category: "Food" },
    { label: "Electric & Gas", amount: randomBetween(60, 150), category: "Utilities" },
    { label: "Internet & Phone", amount: randomBetween(50, 120), category: "Utilities" },
    { label: "Transport / Fuel", amount: randomBetween(80, 250), category: "Transport" },
    { label: "Dining Out", amount: randomBetween(50, 200), category: "Food" },
    { label: "Subscriptions", amount: randomBetween(20, 60), category: "Entertainment" },
    {
      label: EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)],
      amount: randomBetween(30, 150),
      category: EXPENSE_CATEGORIES[Math.floor(Math.random() * EXPENSE_CATEGORIES.length)],
    },
  ];

  const savings = [
    {
      label: "AJO Contribution",
      amount: randomBetween(100, 400),
      category: "AJO" as const,
    },
    {
      label: "Emergency Fund",
      amount: randomBetween(50, 300),
      category: "OTHER" as const,
    },
  ];

  const label = fileName
    ? fileName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
    : `${monthName} ${year} Budget`;

  return { label, incomes, expenses, savings };
}
