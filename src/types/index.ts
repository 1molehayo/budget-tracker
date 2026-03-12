export type TagCategory = "INCOME" | "SAVINGS";
export type SavingDestinationType = "GENERAL" | "PROJECT";
export type ProjectStatus = "PENDING" | "IN_PROGRESS" | "PAUSED" | "READY" | "COMPLETED";

export interface Tag {
  id: string;
  userId: string;
  code: string;
  label?: string | null;
  category: TagCategory;
  isSystemTag: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  monthId: string;
  label: string;
  amount: number;
  tagId?: string | null;
  tag?: Tag | null;
}

export interface BudgetLineItem {
  id: string;
  monthId: string;
  label: string;
  amount: number;
  category?: string | null;
}

export interface ProjectSummary {
  id: string;
  title: string;
  status: ProjectStatus;
}

export interface Saving {
  id: string;
  monthId: string;
  label: string;
  amount: number;
  destinationType: SavingDestinationType;
  tagId?: string | null;
  projectId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  tag?: Tag | null;
  project?: ProjectSummary | null;
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
  legacySavedAmount: number;
  status: ProjectStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  savings?: Saving[];
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

export interface ChartBreakdownItem {
  name: string;
  value: number;
}
