import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Expense, Category } from '../types';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  categories: Category[];
  onUpdateExpense: (id: string, data: Partial<Expense>) => Promise<boolean>;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  isOpen,
  onClose,
  expense,
  categories,
  onUpdateExpense,
}) => {
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Card');
  const [serialNo, setSerialNo] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (expense) {
      setDate(expense.date);
      setCategory(expense.category);
      setDescription(expense.description);
      setAmount(expense.amount.toString());
      setPaymentMethod(expense.paymentMethod || 'Card');
      setSerialNo(expense.serialNo);
      setNotes(expense.notes || '');
      setError('');
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please provide a valid amount in SAR');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdateExpense(expense.id, {
        date,
        category,
        description: description.trim(),
        amount: parsedAmount,
        paymentMethod,
        serialNo,
        notes: notes.trim(),
      });
      if (success) {
        onClose();
      } else {
        setError('Failed to update expense');
      }
    } catch (err: any) {
      setError(err?.message || 'Error updating expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-[#dadce0] overflow-hidden">
        <div className="px-6 py-4.5 bg-white border-b border-[#f1f3f4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1a73e8]"></span>
            <h3 className="font-medium text-[#202124] text-lg google-font-heading">
              Edit Expense #{serialNo}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#5f6368] hover:text-[#202124] p-1.5 rounded-full hover:bg-[#f1f3f4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-[#c5221f] bg-[#fce8e6] border border-[#fad2cf] rounded-xl">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Serial Number
              </label>
              <input
                type="number"
                value={serialNo}
                onChange={(e) => setSerialNo(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#1a73e8] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:bg-white focus:outline-none focus:border-[#1a73e8] font-medium"
                required
              >
                {categories.map((c) => (
                  <option key={c.id || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
                Amount (SAR)
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold text-[#202124] bg-[#f8fafd] border border-[#dadce0] rounded-xl focus:bg-white focus:outline-none focus:border-[#1a73e8]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Al-Othaim Supermarket"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] placeholder:text-[#70757a] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
            >
              <option value="Mada">Mada</option>
              <option value="Card">Card</option>
              <option value="STC Pay">STC Pay</option>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#5f6368] mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Receipt details or notes"
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#f8fafd] border border-[#dadce0] rounded-xl text-[#202124] placeholder:text-[#70757a] focus:bg-white focus:outline-none focus:border-[#1a73e8]"
            />
          </div>

          <div className="pt-3 flex justify-end items-center gap-2 border-t border-[#f1f3f4]">
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
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-full disabled:opacity-50 transition-colors shadow-xs"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
