export type MonthStatus = "DRAFT" | "PUBLISHED";
export type SavingCategory = "AJO" | "OTHER";
export type ProjectStatus = "PLANNED" | "COMPLETED";

export interface Income {
  id: string;
  monthId: string;
  label: string;
  amount: number;
}

export interface Expense {
  id: string;
  monthId: string;
  label: string;
  amount: number;
  category?: string | null;
}

export interface Saving {
  id: string;
  monthId: string;
  label: string;
  amount: number;
  category: SavingCategory;
}

export interface Month {
  id: string;
  userId: string;
  label: string;
  year: number;
  month: number;
  status: MonthStatus;
  remainingBalance: number;
  photoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  incomes?: Income[];
  expenses?: Expense[];
  savings?: Saving[];
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  targetAmount: number;
  savedAmount: number;
  status: ProjectStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface MonthWithDetails extends Month {
  incomes: Income[];
  expenses: Expense[];
  savings: Saving[];
}

export interface DashboardStats {
  totalMonths: number;
  publishedMonths: number;
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;
  avgMonthlySavings: number;
  totalProjects: number;
}

export interface MockOcrResult {
  label: string;
  incomes: Omit<Income, "id" | "monthId">[];
  expenses: Array<{ label: string; amount: number; category?: string }>;
  savings: Omit<Saving, "id" | "monthId">[];
}

export interface ChartDataPoint {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  remaining: number;
}
