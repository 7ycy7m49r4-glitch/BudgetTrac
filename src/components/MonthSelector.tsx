import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, BarChart3, Clock, Sparkles } from 'lucide-react';
import { formatMonthLabel, getPreviousMonth, getNextMonth, getCurrentMonth } from '../utils/dateUtils';
import { MonthlySummary } from '../types';

interface MonthSelectorProps {
  selectedMonth: string; // 'YYYY-MM' or 'all'
  onSelectMonth: (month: string) => void;
  availableMonths: string[];
  monthlySummaries: MonthlySummary[];
  onOpenHistoryModal: () => void;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonth,
  onSelectMonth,
  availableMonths,
  monthlySummaries,
  onOpenHistoryModal,
}) => {
  const currentMonthStr = getCurrentMonth();
  const isCurrentMonth = selectedMonth === currentMonthStr;
  const isAllTime = selectedMonth === 'all';
  const isFuture = !isAllTime && selectedMonth > currentMonthStr;
  const isPast = !isAllTime && selectedMonth < currentMonthStr;

  const handlePrev = () => {
    if (isAllTime) {
      onSelectMonth(currentMonthStr);
    } else {
      onSelectMonth(getPreviousMonth(selectedMonth));
    }
  };

  const handleNext = () => {
    if (isAllTime) {
      onSelectMonth(currentMonthStr);
    } else {
      onSelectMonth(getNextMonth(selectedMonth));
    }
  };

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-3 sm:px-5 sm:py-3.5 shadow-xs transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Interactive Month Navigator */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* Previous Month Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            title="Previous month"
            className="w-8 h-8 flex items-center justify-center text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] active:bg-[#e8eaed] rounded-full border border-[#dadce0] transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Month Selector Pill */}
          <div className="relative">
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#f8fafd] hover:bg-[#f1f3f4] border border-[#dadce0] rounded-full cursor-pointer transition-colors">
              <Calendar className="w-4 h-4 text-[#1a73e8] flex-shrink-0" />
              <select
                value={selectedMonth}
                onChange={(e) => onSelectMonth(e.target.value)}
                aria-label="Select month"
                className="bg-transparent text-sm font-medium text-[#202124] focus:outline-none cursor-pointer pr-3 appearance-none google-font-heading"
              >
                <option value="all">All Months</option>
                <optgroup label="Monthly Cycles">
                  {availableMonths.map((m) => {
                    const summary = monthlySummaries.find((s) => s.month === m);
                    const count = summary ? summary.expenseCount : 0;
                    const isCur = m === currentMonthStr;
                    return (
                      <option key={m} value={m}>
                        {formatMonthLabel(m)} {isCur ? '• Current' : ''} ({count} {count === 1 ? 'entry' : 'entries'})
                      </option>
                    );
                  })}
                </optgroup>
              </select>
              <span className="text-[#5f6368] text-[10px] pointer-events-none">▼</span>
            </div>
          </div>

          {/* Next Month Arrow */}
          <button
            type="button"
            onClick={handleNext}
            title="Next month"
            className="w-8 h-8 flex items-center justify-center text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] active:bg-[#e8eaed] rounded-full border border-[#dadce0] transition-colors flex-shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to Current Month Chip */}
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => onSelectMonth(currentMonthStr)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] border border-[#d2e3fc] transition-colors whitespace-nowrap"
            >
              <Clock className="w-3 h-3" />
              <span>Current Month</span>
            </button>
          )}
        </div>

        {/* Right: Clean Status Badge & History Action */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Badge */}
          {isCurrentMonth ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
              <span className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse"></span>
              <span>Active Cycle</span>
            </span>
          ) : isPast ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#f1f3f4] text-[#5f6368] border border-[#dadce0]">
              <Clock className="w-3 h-3 text-[#5f6368]" />
              <span>Past Archive</span>
            </span>
          ) : isFuture ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
              <Sparkles className="w-3 h-3 text-[#1a73e8]" />
              <span>Next Cycle (Starts Fresh)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
              <span>Cumulative</span>
            </span>
          )}

          {/* All Time Toggle */}
          <button
            type="button"
            onClick={() => onSelectMonth(isAllTime ? currentMonthStr : 'all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
              isAllTime
                ? 'bg-[#1a73e8] text-white border-[#1a73e8]'
                : 'bg-white text-[#5f6368] border-[#dadce0] hover:bg-[#f1f3f4]'
            }`}
          >
            {isAllTime ? 'Showing All Time' : 'All Time'}
          </button>

          {/* Archives Launcher */}
          <button
            type="button"
            onClick={onOpenHistoryModal}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium text-[#202124] bg-[#f8fafd] hover:bg-[#f1f3f4] border border-[#dadce0] transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#1a73e8]" />
            <span>Archives</span>
          </button>
        </div>
      </div>
    </div>
  );
};
