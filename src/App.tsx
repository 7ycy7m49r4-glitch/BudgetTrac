import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { MonthSelector } from './components/MonthSelector';
import { BudgetOverview } from './components/BudgetOverview';
import { CategoryProgressList } from './components/CategoryProgressList';
import { ExpenseList } from './components/ExpenseList';
import { DailyLogModal } from './components/DailyLogModal';
import { BulkAddModal } from './components/BulkAddModal';
import { BackendInspectorModal } from './components/BackendInspectorModal';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { EditExpenseModal } from './components/EditExpenseModal';
import { MonthlyHistoryModal } from './components/MonthlyHistoryModal';
import { Category, Expense, CategoryBudgetProgress, MonthlySummary } from './types';
import { getCurrentMonth, getDistinctMonths } from './utils/dateUtils';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Zap, Calendar } from 'lucide-react';

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Month navigation state: defaults to current month (e.g. '2026-09')
  const [selectedMonth, setSelectedMonth] = useState<string>(() => getCurrentMonth());
  const [serverAvailableMonths, setServerAvailableMonths] = useState<string[]>([]);
  const [serverMonthlySummaries, setServerMonthlySummaries] = useState<MonthlySummary[]>([]);

  // Modal open states
  const [isDailyModalOpen, setIsDailyModalOpen] = useState<boolean>(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedCategoryForDaily, setSelectedCategoryForDaily] = useState<string | undefined>(undefined);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Fetch all backend data
  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setCategories(data.categories || []);
      setExpenses(data.expenses || []);
      if (data.availableMonths) setServerAvailableMonths(data.availableMonths);
      if (data.monthlySummaries) setServerMonthlySummaries(data.monthlySummaries);
      setBackendConnected(true);
    } catch (err) {
      console.error('Failed to sync with backend:', err);
      setBackendConnected(false);
      if (!silent) showToast('Could not reach backend server', 'error');
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Distinct available months derived from expenses
  const availableMonths = useMemo(() => {
    if (serverAvailableMonths && serverAvailableMonths.length > 0) {
      return serverAvailableMonths;
    }
    return getDistinctMonths(expenses.map((e) => e.date));
  }, [serverAvailableMonths, expenses]);

  // Client-computed monthly summaries across all available months
  const monthlySummaries: MonthlySummary[] = useMemo(() => {
    if (serverMonthlySummaries && serverMonthlySummaries.length > 0) {
      return serverMonthlySummaries;
    }
    const currentM = getCurrentMonth();
    const totalMonthlyBudget = categories.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);

    return availableMonths.map((m) => {
      const mExpenses = expenses.filter((e) => e.date && e.date.startsWith(m));
      const spent = mExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const remaining = totalMonthlyBudget - spent;
      const percentage = totalMonthlyBudget > 0 ? (spent / totalMonthlyBudget) * 100 : 0;

      const [yStr, mStr] = m.split('-');
      const dateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      return {
        month: m,
        label,
        totalBudget: totalMonthlyBudget,
        totalSpent: spent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        expenseCount: mExpenses.length,
        isCurrentMonth: m === currentM,
      };
    });
  }, [serverMonthlySummaries, availableMonths, categories, expenses]);

  // Filter expenses according to the currently active selectedMonth
  const activeMonthExpenses = useMemo(() => {
    if (selectedMonth === 'all') {
      return expenses;
    }
    return expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  // Compute category-level progress and stats for the active month
  const { categoryProgress, totalBudget, totalSpent, remaining, overallPercentage } = useMemo(() => {
    const totalBud = categories.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
    const totalSp = activeMonthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const rem = totalBud - totalSp;
    const pct = totalBud > 0 ? (totalSp / totalBud) * 100 : 0;

    const progressList: CategoryBudgetProgress[] = categories.map((cat) => {
      const catExpenses = activeMonthExpenses.filter(
        (e) => e.category.toLowerCase() === cat.name.toLowerCase()
      );
      const spent = catExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const budget = Number(cat.budget) || 0;
      const remainingAmount = budget - spent;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;

      let status: 'safe' | 'warning' | 'exceeded' = 'safe';
      if (spent > budget) {
        status = 'exceeded';
      } else if (percentage >= 75) {
        status = 'warning';
      }

      return {
        category: cat,
        spent,
        budget,
        remaining: remainingAmount,
        percentage,
        status,
        expenseCount: catExpenses.length,
      };
    });

    return {
      categoryProgress: progressList,
      totalBudget: totalBud,
      totalSpent: totalSp,
      remaining: rem,
      overallPercentage: pct,
    };
  }, [categories, activeMonthExpenses]);

  // Serial number helper for next daily log
  const nextSerialNo = useMemo(() => {
    if (expenses.length === 0) return 1;
    const max = Math.max(...expenses.map((e) => e.serialNo || 0));
    return max + 1;
  }, [expenses]);

  // Handler: Add Daily Log
  const handleAddDailyExpense = async (data: {
    date: string;
    category: string;
    description: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    serialNo?: number;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to save');
      await fetchData(true);
      showToast(`Daily log #${data.serialNo || nextSerialNo} saved to backend (${data.amount} SAR)`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Handler: Bulk Add Expenses (10-15 items)
  const handleBulkAddExpenses = async (items: Array<{
    serialNo?: number;
    date: string;
    category: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    notes?: string;
  }>): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error('Failed to bulk add');
      const result = await res.json();
      await fetchData(true);
      showToast(`Successfully added ${result.addedCount} serial items to backend database!`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Handler: Update Expense
  const handleUpdateExpense = async (id: string, data: Partial<Expense>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to update');
      await fetchData(true);
      showToast('Expense log updated in backend', 'success');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Handler: Delete Expense
  const handleDeleteExpense = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      await fetchData(true);
      showToast('Expense log deleted from backend', 'info');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Handler: Save Category
  const handleSaveCategory = async (categoryData: {
    name: string;
    budget: number;
    color?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (!res.ok) throw new Error('Failed to save category');
      await fetchData(true);
      showToast(`Category "${categoryData.name}" budget set to ${categoryData.budget} SAR`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Handler: Delete Category
  const handleDeleteCategory = async (categoryName: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/categories/${encodeURIComponent(categoryName)}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete category');
      await fetchData(true);
      showToast(`Category "${categoryName}" removed`, 'info');
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Handler: Reset Database
  const handleResetDatabase = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reset');
      await fetchData(true);
      showToast('Backend database restored to initial preset', 'info');
    } catch (err) {
      console.error(err);
      showToast('Reset failed', 'error');
    }
  };

  const handleOpenCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCategoriesModalOpen(true);
  };

  const handleQuickAddForCategory = (categoryName: string) => {
    setSelectedCategoryForDaily(categoryName);
    setIsDailyModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafd] text-[#1f1f1f] flex flex-col antialiased selection:bg-[#c2e7ff] selection:text-[#001d35]">
      {/* Top Navigation */}
      <Navbar
        onOpenDailyModal={() => {
          setSelectedCategoryForDaily(undefined);
          setIsDailyModalOpen(true);
        }}
        onOpenBulkModal={() => setIsBulkModalOpen(true)}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        onOpenCategoriesModal={() => {
          setEditingCategory(null);
          setIsCategoriesModalOpen(true);
        }}
        onRefreshData={() => fetchData()}
        isSyncing={isSyncing}
        backendConnected={backendConnected}
        totalExpensesCount={expenses.length}
      />

      {/* Toast Notification in Google Material 3 style */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-300">
          <div className={`px-4 py-3 rounded-full shadow-lg border text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
            toast.type === 'success'
              ? 'bg-[#1e1e1e] text-white border-transparent'
              : toast.type === 'error'
              ? 'bg-[#b3261e] text-white border-transparent'
              : 'bg-[#202124] text-white border-transparent'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#8ab4f8]" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#fdd663]" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* 1. Month Cycle Switcher & Historical Archive Selector */}
        <MonthSelector
          selectedMonth={selectedMonth}
          onSelectMonth={(m) => setSelectedMonth(m)}
          availableMonths={availableMonths}
          monthlySummaries={monthlySummaries}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        />

        {/* 2. Monthly Budget & Consumption Overview */}
        <BudgetOverview
          totalBudget={totalBudget}
          totalSpent={totalSpent}
          remaining={remaining}
          percentage={overallPercentage}
          categoryProgress={categoryProgress}
          totalLogsCount={activeMonthExpenses.length}
          selectedMonth={selectedMonth}
          onOpenHistoryModal={() => setIsHistoryModalOpen(true)}
        />

        {/* 3. Visual Progress Bars for Each Category */}
        <CategoryProgressList
          categoryProgress={categoryProgress}
          onAddLogForCategory={handleQuickAddForCategory}
          onEditCategory={handleOpenCategoryEdit}
          onOpenNewCategory={() => {
            setEditingCategory(null);
            setIsCategoriesModalOpen(true);
          }}
        />

        {/* 4. Expense History Table & Serial Number Tracker */}
        <ExpenseList
          expenses={activeMonthExpenses}
          categories={categories}
          selectedMonth={selectedMonth}
          onDeleteExpense={handleDeleteExpense}
          onEditExpense={(exp) => setEditingExpense(exp)}
          onOpenDailyModal={() => {
            setSelectedCategoryForDaily(undefined);
            setIsDailyModalOpen(true);
          }}
          onOpenBulkModal={() => setIsBulkModalOpen(true)}
          onToggleAllMonths={() => setSelectedMonth(selectedMonth === 'all' ? getCurrentMonth() : 'all')}
        />
      </main>

      {/* Google Style Footer */}
      <footer className="border-t border-[#dadce0] bg-white py-6 mt-12 text-xs text-[#5f6368]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#202124]">Expense & Budget Manager</span>
            <span>•</span>
            <span className="text-[#1a73e8] font-medium">SAR Currency</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 font-mono text-[#5f6368]">
              <span className="w-2 h-2 rounded-full bg-[#34a853]"></span>
              API: /api/expenses
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="text-[#1a73e8] hover:text-[#1557b0] font-medium hover:underline flex items-center gap-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Monthly Archives</span>
            </button>
            <span>•</span>
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="text-[#1a73e8] hover:text-[#1557b0] font-medium hover:underline flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>View Data Added in Backend</span>
            </button>
            <span>•</span>
            <button
              onClick={handleResetDatabase}
              className="text-[#5f6368] hover:text-[#d93025] transition-colors"
            >
              Reset to 6,400 SAR Preset
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DailyLogModal
        isOpen={isDailyModalOpen}
        onClose={() => setIsDailyModalOpen(false)}
        categories={categories}
        suggestedSerialNo={nextSerialNo}
        initialCategory={selectedCategoryForDaily}
        selectedMonth={selectedMonth}
        onAddExpense={handleAddDailyExpense}
      />

      <BulkAddModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        categories={categories}
        startSerialNo={nextSerialNo}
        selectedMonth={selectedMonth}
        onBulkAddExpenses={handleBulkAddExpenses}
      />

      <MonthlyHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        monthlySummaries={monthlySummaries}
        selectedMonth={selectedMonth}
        onSelectMonth={(m) => setSelectedMonth(m)}
      />

      <BackendInspectorModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        onResetDatabase={handleResetDatabase}
      />

      <ManageCategoriesModal
        isOpen={isCategoriesModalOpen}
        onClose={() => {
          setIsCategoriesModalOpen(false);
          setEditingCategory(null);
        }}
        categories={categories}
        editingCategory={editingCategory}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        expense={editingExpense}
        categories={categories}
        onUpdateExpense={handleUpdateExpense}
      />
    </div>
  );
}
