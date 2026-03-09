export type SavingCategory = "AJO" | "OTHER";
export type ProjectStatus = "PLANNED" | "ONGOING" | "COMPLETED";

export interface Income {
  id: string;
  monthId: string;
  label: string;
  amount: number;
}

export interface BudgetLineItem {
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
  remainingBalanceOverride?: number | null;
  createdAt: Date;
  updatedAt: Date;
  incomes?: Income[];
  budgetLineItems?: BudgetLineItem[];
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
  budgetLineItems: BudgetLineItem[];
  savings: Saving[];
}

export interface DashboardStats {
  totalMonths: number;
  avgMonthlyIncome: number;
  avgMonthlyBudgetItems: number;
  avgMonthlySavings: number;
  totalProjects: number;
}

export interface ChartDataPoint {
  month: string;
  income: number;
  budgetItems: number;
  savings: number;
  remaining: number;
}
