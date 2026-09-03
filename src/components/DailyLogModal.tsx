import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, DollarSign, Tag, FileText, CreditCard, Hash } from 'lucide-react';
import { Category } from '../types';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  suggestedSerialNo: number;
  initialCategory?: string;
  selectedMonth?: string;
  onAddExpense: (data: {
    date: string;
    category: string;
    description: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    serialNo?: number;
  }) => Promise<boolean>;
}

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  categories,
  suggestedSerialNo,
  initialCategory,
  selectedMonth,
  onAddExpense,
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Mada');
  const [notes, setNotes] = useState<string>('');
  const [serialNo, setSerialNo] = useState<number>(suggestedSerialNo);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSerialNo(suggestedSerialNo);
      
      // Determine default date based on selected month
      const today = new Date().toISOString().split('T')[0];
      if (selectedMonth && selectedMonth !== 'all') {
        if (today.startsWith(selectedMonth)) {
          setDate(today);
        } else {
          setDate(`${selectedMonth}-01`);
        }
      } else {
        setDate(today);
      }

      if (initialCategory) {
        setCategory(initialCategory);
      } else if (categories.length > 0 && !category) {
        setCategory(categories[0].name);
      }
      setError('');
    }
  }, [isOpen, suggestedSerialNo, initialCategory, categories, selectedMonth]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0 SAR');
      return;
    }
    if (!category) {
      setError('Please select an expense category');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddExpense({
        date,
        category,
        description: description.trim() || `${category} expense`,
        amount: parsedAmount,
        paymentMethod,
        notes: notes.trim(),
        serialNo,
      });

      if (success) {
        // Reset and close
        setDescription('');
        setAmount('');
        setNotes('');
        onClose();
      } else {
        setError('Failed to save to backend database. Please retry.');
      }
    } catch (err: any) {
      setError(err?.message || 'Server error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-[#dadce0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 bg-white border-b border-[#f1f3f4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] flex items-center justify-center font-medium text-sm">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-medium text-[#202124] text-lg google-font-heading">
                Add Daily Expense Log
              </h3>
              <p className="text-xs text-[#5f6368]">Record daily spending with automatic serial numbering</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5f6368] hover:text-[#202124] p-1.5 rounded-full hover:bg-[#f1f3f4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-medium text-[#c5221f] bg-[#fce8e6] border border-[#fad2cf] rounded-xl">
              {error}
            </div>
          )}

          {/* Serial Number & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Serial Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#1a73e8] font-bold text-sm">
                  #
                </span>
                <input
                  type="number"
                  min="1"
                  value={serialNo}
                  onChange={(e) => setSerialNo(parseInt(e.target.value) || 1)}
                  className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#1a73e8] font-semibold focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                  required
                />
              </div>
              <span className="text-[11px] text-[#70757a] mt-1 block">Consecutive S.No</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Log Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                  required
                />
              </div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => handleQuickDate(0)}
                  className="text-[11px] text-[#1a73e8] hover:underline font-medium"
                >
                  Today
                </button>
                <span className="text-[#dadce0]">•</span>
                <button
                  type="button"
                  onClick={() => handleQuickDate(1)}
                  className="text-[11px] text-[#5f6368] hover:underline"
                >
                  Yesterday
                </button>
              </div>
            </div>
          </div>

          {/* Category & Amount in SAR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:bg-white focus:outline-none focus:border-[#1a73e8] font-medium"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id || cat.name} value={cat.name}>
                    {cat.name} ({cat.budget} SAR)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Amount (SAR)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 150"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-3.5 pr-14 py-2.5 text-sm sm:text-base font-semibold text-[#202124] bg-[#f8fafd] border border-[#dadce0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                  required
                  autoFocus
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs font-semibold text-[#1a73e8]">
                  SAR
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
              Description / Place / Item
            </label>
            <input
              type="text"
              placeholder="e.g. Lulu Hypermarket groceries, Al Baik dinner, Utility payment"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] placeholder:text-[#70757a] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
            />
          </div>

          {/* Payment Method in Google Chips */}
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
              Payment Method
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {['Mada', 'STC Pay', 'Card', 'Cash', 'Bank Transfer'].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-2 text-xs font-medium rounded-full border transition-all text-center ${
                    paymentMethod === method
                      ? 'bg-[#e8f0fe] border-[#1a73e8] text-[#1a73e8] shadow-2xs font-semibold'
                      : 'bg-white border-[#dadce0] text-[#5f6368] hover:text-[#202124] hover:bg-[#f8fafd]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="Receipt number, invoice, or remarks"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] placeholder:text-[#70757a] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#f1f3f4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] active:scale-98 rounded-full shadow-xs disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <span>Saving to Backend...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Log #{serialNo}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
