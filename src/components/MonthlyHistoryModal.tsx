import React from 'react';
import { X, Calendar, ArrowRight, CheckCircle2, TrendingUp, Sparkles, Clock, Layers } from 'lucide-react';
import { MonthlySummary } from '../types';
import { getCurrentMonth } from '../utils/dateUtils';

interface MonthlyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlySummaries: MonthlySummary[];
  selectedMonth: string;
  onSelectMonth: (month: string) => void;
}

export const MonthlyHistoryModal: React.FC<MonthlyHistoryModalProps> = ({
  isOpen,
  onClose,
  monthlySummaries,
  selectedMonth,
  onSelectMonth,
}) => {
  if (!isOpen) return null;

  const currentMonth = getCurrentMonth();

  const handleSelectAndClose = (month: string) => {
    onSelectMonth(month);
    onClose();
  };

  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' SAR';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white text-[#202124] w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-xl border border-[#dadce0] flex flex-col overflow-hidden font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 bg-white border-b border-[#f1f3f4] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-[#202124] text-lg google-font-heading">
                Monthly Cycles & Historical Archives
              </h3>
              <p className="text-xs text-[#5f6368]">
                Access past months, review spending history, and inspect renewed upcoming cycles
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explanation Card for Monthly Renewal */}
        <div className="px-6 py-4 bg-[#f8fafd] border-b border-[#f1f3f4] text-xs sm:text-sm text-[#3c4043] flex items-start gap-3 flex-shrink-0">
          <div className="p-2 rounded-full bg-[#e8f0fe] text-[#1a73e8] mt-0.5 flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-medium text-[#202124] block mb-0.5">
              How Month Rollover Works
            </span>
            <p className="text-xs text-[#5f6368] leading-relaxed">
              When a new month arrives, your monthly budget (e.g. Grocery 600 SAR, Food 600 SAR, Rent 2,250 SAR, total 6,400 SAR) <strong>automatically renews and starts fresh with 0 SAR spent</strong>. 
              All previous months&apos; records, entries, and progress charts are <strong>permanently stored in the backend</strong> and remain accessible at any time.
            </p>
          </div>
        </div>

        {/* Content: List of Months */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monthlySummaries.map((summary) => {
              const isSelected = selectedMonth === summary.month;
              const isCurrent = summary.month === currentMonth;
              const isFuture = summary.month > currentMonth;
              const isOver = summary.totalSpent > summary.totalBudget;

              return (
                <div
                  key={summary.month}
                  className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#1a73e8] bg-[#f8fafd] shadow-sm ring-2 ring-[#1a73e8]/20'
                      : 'border-[#dadce0] bg-white hover:border-[#1a73e8]/50 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Top Row: Month Label & Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-[#202124] google-font-heading">
                          {summary.label}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                            Current Cycle
                          </span>
                        )}
                        {isFuture && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                            Upcoming (Renewed)
                          </span>
                        )}
                        {!isCurrent && !isFuture && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">
                            Past Archive
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a73e8]">
                          <CheckCircle2 className="w-4 h-4 text-[#1a73e8]" />
                          Active View
                        </span>
                      )}
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#f8fafd] border border-[#dadce0] mb-3 text-center">
                      <div>
                        <span className="text-[11px] text-[#5f6368] block">Budget</span>
                        <span className="text-xs font-semibold text-[#202124]">
                          {formatSAR(summary.totalBudget)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#5f6368] block">Spent</span>
                        <span className="text-xs font-semibold text-[#1a73e8]">
                          {formatSAR(summary.totalSpent)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-[#5f6368] block">Remaining</span>
                        <span className={`text-xs font-semibold ${isOver ? 'text-[#c5221f]' : 'text-[#137333]'}`}>
                          {formatSAR(summary.remaining)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-[#5f6368] mb-1">
                        <span>Utilization</span>
                        <span className="font-semibold text-[#202124]">{summary.percentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full h-2 bg-[#e8eaed] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver ? 'bg-[#ea4335]' : summary.percentage >= 80 ? 'bg-[#f9ab00]' : 'bg-[#1a73e8]'
                          }`}
                          style={{ width: `${Math.min(summary.percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-[#5f6368]">
                      Ledger contains <strong className="text-[#202124]">{summary.expenseCount}</strong> serial transaction {summary.expenseCount === 1 ? 'entry' : 'entries'}.
                    </p>
                  </div>

                  {/* Switch to this month button */}
                  <div className="mt-4 pt-3 border-t border-[#f1f3f4] flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleSelectAndClose(summary.month)}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#e8f0fe] text-[#1a73e8] hover:bg-[#d2e3fc]'
                          : 'bg-white hover:bg-[#f1f3f4] text-[#202124] border border-[#dadce0]'
                      }`}
                    >
                      <span>{isSelected ? 'Currently Viewing' : 'Switch to this Month'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* All Time Option Card */}
          <div className="p-4 rounded-2xl border border-[#dadce0] bg-[#f8fafd] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white border border-[#dadce0] flex items-center justify-center text-[#1a73e8]">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm text-[#202124] block">
                  All-Time Cumulative View
                </span>
                <span className="text-xs text-[#5f6368]">
                  View all expenses combined across all months in an unbroken continuous ledger.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectAndClose('all')}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedMonth === 'all'
                  ? 'bg-[#1a73e8] text-white'
                  : 'bg-white text-[#202124] border border-[#dadce0] hover:bg-[#f1f3f4]'
              }`}
            >
              {selectedMonth === 'all' ? 'Active View' : 'View All Time'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#f1f3f4] flex items-center justify-between flex-shrink-0 text-xs text-[#5f6368]">
          <span>Select any month to view its dedicated budget breakdown and transaction entries.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-white hover:bg-[#f1f3f4] border border-[#dadce0] text-[#202124] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
