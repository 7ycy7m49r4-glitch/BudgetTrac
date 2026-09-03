export interface Category {
  id: string;
  name: string;
  budget: number; // in SAR
  color: string;
  icon?: string;
}

export interface Expense {
  id: string;
  serialNo: number;
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  amount: number; // in SAR
  paymentMethod?: 'Cash' | 'Card' | 'Bank Transfer' | 'Mada' | 'STC Pay' | 'Other';
  createdAt: string;
  notes?: string;
}

export interface BackendAuditLog {
  id: string;
  timestamp: string;
  action: 'ADD_EXPENSE' | 'BULK_ADD' | 'UPDATE_EXPENSE' | 'DELETE_EXPENSE' | 'UPDATE_BUDGET' | 'ADD_CATEGORY' | 'DELETE_CATEGORY' | 'RESET';
  details: string;
  affectedCount: number;
  ip?: string;
}

export interface DatabaseState {
  categories: Category[];
  expenses: Expense[];
  auditLogs: BackendAuditLog[];
  lastUpdated: string;
  currency: string;
}

export interface CategoryBudgetProgress {
  category: Category;
  spent: number;
  budget: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'exceeded'; // safe: <75%, warning: 75-100%, exceeded: >100%
  expenseCount: number;
}

export interface MonthlySummary {
  month: string; // YYYY-MM format
  label: string; // e.g. "September 2026"
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  expenseCount: number;
  isCurrentMonth?: boolean;
}

