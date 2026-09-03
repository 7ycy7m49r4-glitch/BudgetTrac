import React from 'react';
import { motion } from 'motion/react';
import { Wallet, TrendingDown, CheckCircle, AlertTriangle, ArrowUpRight, Calendar, BarChart3, Clock, Sparkles } from 'lucide-react';
import { CategoryBudgetProgress } from '../types';
import { formatMonthLabel, getCurrentMonth } from '../utils/dateUtils';

interface BudgetOverviewProps {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  percentage: number;
  categoryProgress: CategoryBudgetProgress[];
  totalLogsCount: number;
  selectedMonth: string;
  onOpenHistoryModal?: () => void;
}

export const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalBudget,
  totalSpent,
  remaining,
  percentage,
  categoryProgress,
  totalLogsCount,
  selectedMonth,
  onOpenHistoryModal,
}) => {
  const currentMonthStr = getCurrentMonth();
  const isCurrent = selectedMonth === currentMonthStr;
  const isAllTime = selectedMonth === 'all';
  const isFuture = !isAllTime && selectedMonth > currentMonthStr;
  const isPast = !isAllTime && selectedMonth < currentMonthStr;

  // Determine overall status
  const isOver = totalSpent > totalBudget;
  const isNear = !isOver && percentage >= 80;

  // Format SAR currency with precision
  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl border border-[#dadce0] p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#f1f3f4]">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-medium text-[#202124] tracking-tight google-font-heading">
              {isAllTime ? 'All-Time Budget Overview' : `${formatMonthLabel(selectedMonth)} Budget`}
            </h2>

            {isCurrent ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-[#34a853]" />
                {percentage.toFixed(0)}% Utilized
              </span>
            ) : isFuture ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                <Sparkles className="w-3.5 h-3.5 mr-1 text-[#1a73e8]" />
                Fresh 6,400 SAR
              </span>
            ) : isPast ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">
                <Clock className="w-3.5 h-3.5 mr-1 text-[#5f6368]" />
                Archived
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
                Cumulative
              </span>
            )}

            {isOver && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]">
                <AlertTriangle className="w-3.5 h-3.5 mr-1 text-[#ea4335]" />
                Budget Exceeded
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#5f6368]">
            {isFuture
              ? 'Starts fresh with 0 SAR spent when this month begins.'
              : isPast
              ? 'Historical archived monthly spend and performance.'
              : `Tracking 8 categories against a 6,400 SAR monthly allocation.`}
          </p>
        </div>

        {onOpenHistoryModal && (
          <button
            onClick={onOpenHistoryModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1a73e8] hover:text-[#1557b0] bg-[#f8fafd] hover:bg-[#e8f0fe] border border-[#dadce0] rounded-full transition-colors self-start sm:self-auto"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Monthly Trends</span>
          </button>
        )}
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-5">
        {/* Total Budget Card */}
        <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#dadce0]">
          <div className="flex items-center justify-between text-[#5f6368] text-xs font-medium uppercase tracking-wider mb-1.5">
            <span>Total Budget</span>
            <Wallet className="w-4 h-4 text-[#1a73e8]" />
          </div>
          <div className="text-2xl font-semibold text-[#202124] tracking-tight google-font-heading">
            {formatSAR(totalBudget)}{' '}
            <span className="text-xs font-normal text-[#5f6368]">SAR</span>
          </div>
          <div className="text-xs text-[#5f6368] mt-1">
            Planned monthly limit
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="p-4 rounded-xl bg-[#f8fafd] border border-[#dadce0]">
          <div className="flex items-center justify-between text-[#5f6368] text-xs font-medium uppercase tracking-wider mb-1.5">
            <span>Actual Spend</span>
            <TrendingDown className="w-4 h-4 text-[#ea4335]" />
          </div>
          <div className="text-2xl font-semibold text-[#202124] tracking-tight google-font-heading">
            {formatSAR(totalSpent)}{' '}
            <span className="text-xs font-normal text-[#5f6368]">SAR</span>
          </div>
          <div className="text-xs text-[#5f6368] mt-1 flex items-center justify-between">
            <span className="font-medium text-[#1a73e8]">{percentage.toFixed(1)}% consumed</span>
            <span>{totalLogsCount} {totalLogsCount === 1 ? 'entry' : 'entries'}</span>
          </div>
        </div>

        {/* Remaining Balance Card */}
        <div className={`p-4 rounded-xl border transition-colors ${
          isOver
            ? 'bg-[#fce8e6]/50 border-[#fad2cf]'
            : remaining < 500
            ? 'bg-[#fef7e0]/50 border-[#feefc3]'
            : 'bg-[#f8fafd] border-[#dadce0]'
        }`}>
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wider mb-1.5">
            <span className={isOver ? 'text-[#c5221f]' : 'text-[#5f6368]'}>
              {isOver ? 'Deficit' : 'Remaining Balance'}
            </span>
            <ArrowUpRight className={`w-4 h-4 ${isOver ? 'text-[#c5221f]' : 'text-[#137333]'}`} />
          </div>
          <div className={`text-2xl font-semibold tracking-tight google-font-heading ${
            isOver ? 'text-[#c5221f]' : 'text-[#137333]'
          }`}>
            {formatSAR(Math.abs(remaining))}{' '}
            <span className="text-xs font-normal text-[#5f6368]">SAR</span>
          </div>
          <div className="text-xs mt-1">
            {isOver ? (
              <span className="text-[#c5221f] font-medium">Over limit</span>
            ) : (
              <span className="text-[#137333] font-medium">Available to spend</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Visual Progress Bar (Material 3 style) */}
      <div className="pt-2">
        <div className="flex items-center justify-between text-xs font-medium mb-2">
          <span className="text-[#3c4043] font-medium flex items-center gap-2">
            <span>Overall Budget Consumption</span>
            <span className="text-[#70757a] font-normal">
              ({formatSAR(totalSpent)} of {formatSAR(totalBudget)} SAR)
            </span>
          </span>
          <span className={`text-xs font-semibold ${
            isOver ? 'text-[#c5221f]' : isNear ? 'text-[#b06000]' : 'text-[#1a73e8]'
          }`}>
            {percentage.toFixed(1)}%
          </span>
        </div>

        {/* Material 3 Linear Progress Bar */}
        <div className="w-full h-3 bg-[#e8eaed] rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all ${
              isOver
                ? 'bg-[#ea4335]'
                : percentage >= 85
                ? 'bg-[#f9ab00]'
                : 'bg-[#1a73e8]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Legend / Ticks */}
        <div className="flex justify-between text-[11px] text-[#70757a] mt-2">
          <span>0 SAR</span>
          <span>50% ({formatSAR(totalBudget * 0.5)} SAR)</span>
          <span>100% Target ({formatSAR(totalBudget)} SAR)</span>
        </div>
      </div>
    </div>
  );
};
