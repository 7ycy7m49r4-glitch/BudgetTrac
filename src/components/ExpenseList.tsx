import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown, Trash2, Edit3, Download, Plus, ListPlus, Calendar, CreditCard, Clock, Layers } from 'lucide-react';
import { Expense, Category } from '../types';
import { formatMonthLabel } from '../utils/dateUtils';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  selectedMonth: string;
  onDeleteExpense: (id: string) => Promise<boolean>;
  onEditExpense: (expense: Expense) => void;
  onOpenDailyModal: () => void;
  onOpenBulkModal: () => void;
  onToggleAllMonths?: () => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  selectedMonth,
  onDeleteExpense,
  onEditExpense,
  onOpenDailyModal,
  onOpenBulkModal,
  onToggleAllMonths,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'serial-desc' | 'serial-asc' | 'date-desc' | 'amount-desc' | 'amount-asc'>('serial-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAllTime = selectedMonth === 'all';

  // Filter and sort
  const filtered = expenses.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.serialNo.toString().includes(searchTerm);

    const matchesCategory = selectedCategory === 'all' || exp.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'serial-desc') return (b.serialNo || 0) - (a.serialNo || 0);
    if (sortBy === 'serial-asc') return (a.serialNo || 0) - (b.serialNo || 0);
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'amount-desc') return b.amount - a.amount;
    if (sortBy === 'amount-asc') return a.amount - b.amount;
    return 0;
  });

  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' SAR';
  };

  const getCategoryColor = (catName: string) => {
    const found = categories.find((c) => c.name.toLowerCase() === catName.toLowerCase());
    return found?.color || '#3B82F6';
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this expense log from backend?')) {
      setDeletingId(id);
      try {
        await onDeleteExpense(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const exportCSV = () => {
    if (sorted.length === 0) return;
    const header = ['Serial No', 'Date', 'Category', 'Description', 'Amount (SAR)', 'Payment Method', 'Notes'];
    const rows = sorted.map((e) => [
      e.serialNo,
      e.date,
      `"${e.category}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.paymentMethod || ''}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `expense_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#dadce0] p-5 sm:p-6 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 mb-5 border-b border-[#f1f3f4]">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className="text-lg font-medium text-[#202124] google-font-heading">
              Transaction History
            </h3>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">
              {filtered.length} {filtered.length === 1 ? 'Record' : 'Records'}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
              {isAllTime ? 'All Months' : formatMonthLabel(selectedMonth)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5f6368]">
            {isAllTime
              ? 'Continuous serial ledger across all historical and current months.'
              : `Entries recorded for ${formatMonthLabel(selectedMonth)}.`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onToggleAllMonths && (
            <button
              onClick={onToggleAllMonths}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#5f6368] hover:text-[#202124] border border-[#dadce0] rounded-full hover:bg-[#f8fafd] transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isAllTime ? 'Current Month' : 'All Months'}</span>
            </button>
          )}

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1a73e8] border border-[#dadce0] rounded-full hover:bg-[#f8fafd] active:bg-[#e8f0fe] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenBulkModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
          >
            <ListPlus className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Bulk Add</span>
          </button>

          <button
            onClick={onOpenDailyModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-full shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Log</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar in Google Style */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-5">
        {/* Search Bar - Google pill style */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by description, serial #, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#f1f3f4] hover:bg-[#e8eaed] focus:bg-white border border-transparent focus:border-[#1a73e8] rounded-full text-[#202124] placeholder:text-[#70757a] focus:outline-none transition-all"
          />
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-4 relative">
          <Filter className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-[#f8fafd] hover:bg-[#f1f3f4] border border-[#dadce0] rounded-full text-[#3c4043] focus:outline-none focus:border-[#1a73e8] font-medium transition-colors cursor-pointer appearance-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="sm:col-span-3 relative">
          <ArrowUpDown className="w-4 h-4 text-[#5f6368] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full pl-10 pr-8 py-2.5 text-xs sm:text-sm bg-[#f8fafd] hover:bg-[#f1f3f4] border border-[#dadce0] rounded-full text-[#3c4043] focus:outline-none focus:border-[#1a73e8] font-medium transition-colors cursor-pointer appearance-none"
          >
            <option value="serial-desc">Serial: High to Low</option>
            <option value="serial-asc">Serial: Low to High</option>
            <option value="date-desc">Newest Date First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Table of Entries in Google Sheets / Finance style */}
      <div className="border border-[#dadce0] rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-[#f8fafd] text-[#5f6368] font-medium text-xs border-b border-[#dadce0]">
              <tr>
                <th className="py-3 px-4 w-20 text-center">S.No</th>
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4 w-40">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 w-32">Payment</th>
                <th className="py-3 px-4 w-36 text-right">Amount</th>
                <th className="py-3 px-4 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f1f3f4] bg-white">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#5f6368]">
                    <div className="max-w-md mx-auto space-y-2">
                      <p className="text-sm font-medium text-[#202124]">
                        {isAllTime
                          ? 'No transaction logs found'
                          : `No expense logs recorded for ${formatMonthLabel(selectedMonth)} yet`}
                      </p>
                      <p className="text-xs text-[#70757a]">
                        {!isAllTime && (
                          <span>
                            Your monthly budget renewed with <strong>0 SAR spent</strong>. You have full 6,400 SAR available.
                          </span>
                        )}
                        {searchTerm && <span> Try clearing your search query.</span>}
                      </p>
                      <div className="pt-2 flex justify-center gap-2">
                        <button
                          onClick={onOpenDailyModal}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Log Expense for {isAllTime ? 'Today' : formatMonthLabel(selectedMonth)}</span>
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                sorted.map((exp) => {
                  const catColor = getCategoryColor(exp.category);
                  return (
                    <tr key={exp.id} className="hover:bg-[#f8fafd] transition-colors">
                      {/* S.No in Google Tonal pill */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                          #{exp.serialNo.toString().padStart(3, '0')}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#5f6368] whitespace-nowrap text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#70757a]" />
                          {exp.date}
                        </span>
                      </td>

                      {/* Category in clean Material chip */}
                      <td className="py-3.5 px-4">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border"
                          style={{
                            backgroundColor: `${catColor}12`,
                            color: catColor,
                            borderColor: `${catColor}30`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: catColor }}
                          />
                          {exp.category}
                        </span>
                      </td>

                      {/* Description & Notes */}
                      <td className="py-3.5 px-4 text-[#202124]">
                        <div className="font-medium text-xs sm:text-sm text-[#202124]">{exp.description}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-[#70757a] mt-0.5">{exp.notes}</div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-[#5f6368]">
                        <span className="inline-flex items-center gap-1 text-xs bg-[#f1f3f4] text-[#3c4043] px-2.5 py-0.5 rounded-full border border-[#dadce0]">
                          <CreditCard className="w-3 h-3 text-[#5f6368]" />
                          {exp.paymentMethod || 'Card'}
                        </span>
                      </td>

                      {/* Amount in SAR */}
                      <td className="py-3.5 px-4 text-right font-medium text-[#202124] text-xs sm:text-sm whitespace-nowrap">
                        {formatSAR(exp.amount)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 text-[#5f6368] hover:text-[#1a73e8] hover:bg-[#e8f0fe] rounded-full transition-colors"
                            title="Edit entry"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            disabled={deletingId === exp.id}
                            className="p-1.5 text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] rounded-full transition-colors disabled:opacity-50"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
