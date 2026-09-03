import React from 'react';
import { motion } from 'motion/react';
import { Plus, Edit2, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { CategoryBudgetProgress, Category } from '../types';

interface CategoryProgressListProps {
  categoryProgress: CategoryBudgetProgress[];
  onAddLogForCategory: (categoryName: string) => void;
  onEditCategory: (category: Category) => void;
  onOpenNewCategory: () => void;
}

export const CategoryProgressList: React.FC<CategoryProgressListProps> = ({
  categoryProgress,
  onAddLogForCategory,
  onEditCategory,
  onOpenNewCategory,
}) => {
  const formatSAR = (amount: number) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' SAR';
  };

  return (
    <div className="bg-white rounded-2xl border border-[#dadce0] p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 mb-5 border-b border-[#f1f3f4]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-lg font-medium text-[#202124] google-font-heading">
              Category Budgets
            </h3>
            <span className="text-[11px] font-medium bg-[#f1f3f4] text-[#5f6368] px-2 py-0.5 rounded-full border border-[#dadce0]">
              {categoryProgress.length} Categories
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5f6368]">
            Allocated monthly limits in Saudi Riyals (SAR).
          </p>
        </div>

        <button
          id="add-new-category-btn"
          onClick={onOpenNewCategory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] active:bg-[#c2e7ff] rounded-full transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Grid of Category Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {categoryProgress.map((item) => {
          const { category, spent, budget, remaining, percentage, expenseCount } = item;
          const isExceeded = spent > budget;
          const isWarning = !isExceeded && percentage >= 75;

          return (
            <div
              key={category.id || category.name}
              className="p-4 rounded-xl border border-[#dadce0] hover:border-[#1a73e8]/40 bg-[#f8fafd] transition-all flex flex-col justify-between"
            >
              {/* Card Header: Category Name, Status Badge, Edit Action */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: category.color || '#1a73e8' }}
                    />
                    <h4 className="font-medium text-[#202124] text-sm truncate google-font-heading">
                      {category.name}
                    </h4>
                    <span className="text-[11px] text-[#70757a]">
                      ({expenseCount})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {isExceeded ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fce8e6] text-[#c5221f] border border-[#fad2cf]">
                        <ShieldAlert className="w-3 h-3 mr-1" />
                        Exceeded
                      </span>
                    ) : isWarning ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#fef7e0] text-[#b06000] border border-[#feefc3]">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {percentage.toFixed(0)}%
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e6f4ea] text-[#137333] border border-[#ceead6]">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-[#34a853]" />
                        On Track
                      </span>
                    )}

                    <button
                      onClick={() => onEditCategory(category)}
                      title={`Edit budget for ${category.name}`}
                      className="p-1 text-[#5f6368] hover:text-[#202124] hover:bg-white rounded-full transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Material Progress Bar Track */}
                <div className="my-2.5">
                  <div className="w-full h-1.5 bg-[#e8eaed] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full transition-all ${
                        isExceeded
                          ? 'bg-[#ea4335]'
                          : isWarning
                          ? 'bg-[#f9ab00]'
                          : 'bg-[#1a73e8]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>

                {/* Numbers Row */}
                <div className="flex items-center justify-between text-xs text-[#5f6368]">
                  <div>
                    <span className="text-[#202124] font-medium">{formatSAR(spent)}</span>
                    <span className="text-[#70757a]"> / {formatSAR(budget)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#70757a] text-[11px]">
                      {isExceeded ? 'Excess: ' : 'Left: '}
                    </span>
                    <span
                      className={`font-medium ${
                        isExceeded ? 'text-[#c5221f]' : 'text-[#137333]'
                      }`}
                    >
                      {formatSAR(Math.abs(remaining))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Log button */}
              <div className="mt-3 pt-2 border-t border-[#e8eaed]/70 flex justify-end">
                <button
                  onClick={() => onAddLogForCategory(category.name)}
                  className="text-xs text-[#1a73e8] hover:text-[#1557b0] font-medium flex items-center gap-1 transition-colors px-2 py-0.5 rounded-full hover:bg-white"
                >
                  <Plus className="w-3 h-3" />
                  <span>Log {category.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
