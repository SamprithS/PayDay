export type Category = 'needs' | 'wants' | 'savings';
export type Recurring = 'monthly' | 'weekly' | null;

export interface CategoryMeta { label: string; color: string; }

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  needs:   { label: 'Needs',   color: '#8b5cf6' },
  wants:   { label: 'Wants',   color: '#06b6d4' },
  savings: { label: 'Savings', color: '#10b981' },
};

export interface SavingsGoal {
  id: string; name: string; target: number; saved: number; emoji?: string;
}

export interface Expense {
  id: string; name: string; amount: number; category: Category;
  date: string; hasBill: boolean; recurring?: Recurring; note?: string; driveFileId?: string;
}

export interface MonthBudget {
  id?: number; year: number; month: number; income: number;
  needsBudget: number; wantsBudget: number; savingsBudget: number;
}