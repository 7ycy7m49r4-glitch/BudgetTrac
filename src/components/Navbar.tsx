import React from 'react';
import { Database, Plus, ListPlus, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenDailyModal: () => void;
  onOpenBulkModal: () => void;
  onOpenBackendModal: () => void;
  onOpenCategoriesModal: () => void;
  onRefreshData: () => void;
  isSyncing: boolean;
  backendConnected: boolean;
  totalExpensesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenDailyModal,
  onOpenBulkModal,
  onOpenBackendModal,
  onOpenCategoriesModal,
  onRefreshData,
  isSyncing,
  backendConnected,
  totalExpensesCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#dadce0] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Google Style Brand & Logo */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Google 4-Color Motif Icon */}
            <div className="relative w-10 h-10 rounded-full bg-[#f8fafd] border border-[#dadce0] flex items-center justify-center shadow-xs flex-shrink-0 group">
              <span className="font-bold text-[#1a73e8] text-lg font-sans">﷼</span>
              {/* Google 4 Dots Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 flex gap-0.5 p-0.5 bg-white rounded-full border border-[#dadce0] shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4285F4]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#FBBC05]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#34A853]"></span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-medium text-[#202124] tracking-tight truncate google-font-heading">
                  Expense & Budget
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                  SAR • Saudi Riyal
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5f6368]">
                <span className="flex items-center gap-1.5">
                  {backendConnected ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#34A853] animate-pulse"></span>
                      <span className="text-[#137333] font-medium">Google Cloud Ready</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-[#ea4335]"></span>
                      <span className="text-[#c5221f] font-medium">Offline</span>
                    </>
                  )}
                </span>
                <span className="text-[#dadce0]">•</span>
                <span className="hidden md:inline text-[#5f6368]">{totalExpensesCount} Serial logs stored</span>
              </div>
            </div>
          </div>

          {/* Action Buttons styled in Google Material 3 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Sync / Refresh in Google round icon button */}
            <button
              id="refresh-backend-btn"
              onClick={onRefreshData}
              title="Refresh from Backend"
              className="p-2 text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] active:bg-[#e8eaed] rounded-full transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-[#1a73e8]' : ''}`} />
            </button>

            {/* Backend Data Inspector Button */}
            <button
              id="open-backend-inspector-btn"
              onClick={onOpenBackendModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#3c4043] bg-[#f1f3f4] hover:bg-[#e8eaed] active:bg-[#dadce0] rounded-full transition-colors"
            >
              <Database className="w-4 h-4 text-[#1a73e8]" />
              <span className="hidden md:inline">Backend Data</span>
              <span className="md:hidden">Backend</span>
            </button>

            {/* Categories / Budget Settings */}
            <button
              id="manage-budgets-btn"
              onClick={onOpenCategoriesModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#3c4043] bg-[#f1f3f4] hover:bg-[#e8eaed] active:bg-[#dadce0] rounded-full transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#5f6368]" />
              <span className="hidden lg:inline">Budgets</span>
            </button>

            {/* Bulk Serial Entry (10-15 Items) in Google Tonal Blue */}
            <button
              id="open-bulk-add-btn"
              onClick={onOpenBulkModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-medium text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] active:bg-[#c2e7ff] rounded-full transition-colors"
            >
              <ListPlus className="w-4 h-4 text-[#1a73e8]" />
              <span className="hidden sm:inline">Bulk Add (10-15)</span>
              <span className="sm:hidden">Bulk</span>
            </button>

            {/* Add Daily Log in Google Primary Blue */}
            <button
              id="open-daily-log-btn"
              onClick={onOpenDailyModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] active:bg-[#174ea6] rounded-full shadow-xs hover:shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Daily Log</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

