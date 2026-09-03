import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Sliders, DollarSign, Palette } from 'lucide-react';
import { Category } from '../types';

interface ManageCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  editingCategory?: Category | null;
  onSaveCategory: (category: { name: string; budget: number; color?: string }) => Promise<boolean>;
  onDeleteCategory: (categoryName: string) => Promise<boolean>;
}

const PALETTE = [
  '#1a73e8', // Google Blue
  '#34a853', // Google Green
  '#f9ab00', // Google Yellow
  '#ea4335', // Google Red
  '#9334e6', // Google Purple
  '#12b5cb', // Google Cyan
  '#fa7b17', // Google Orange
  '#e37400', // Deep Amber
  '#007b83', // Deep Teal
  '#e52592', // Pink
  '#5f6368', // Neutral Slate
  '#185abc', // Navy
];

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  editingCategory,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (editingCategory) {
        setName(editingCategory.name);
        setBudget(editingCategory.budget.toString());
        setColor(editingCategory.color || PALETTE[0]);
      } else {
        setName('');
        setBudget('');
        setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)]);
      }
      setError('');
    }
  }, [isOpen, editingCategory]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide a category name');
      return;
    }
    const numBudget = parseFloat(budget);
    if (isNaN(numBudget) || numBudget < 0) {
      setError('Please provide a valid budget amount (0 or greater SAR)');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSaveCategory({
        name: name.trim(),
        budget: numBudget,
        color,
      });
      if (success) {
        setName('');
        setBudget('');
        onClose();
      } else {
        setError('Failed to save category to backend');
      }
    } catch (err: any) {
      setError(err?.message || 'Error saving category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (catName: string) => {
    if (categories.length <= 1) {
      setError('At least one category must be retained');
      return;
    }
    if (confirm(`Delete category "${catName}"? Existing expenses will be preserved.`)) {
      await onDeleteCategory(catName);
    }
  };

  const totalBudgetCalculated = categories.reduce((sum, c) => sum + (c.budget || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl border border-[#dadce0] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-white border-b border-[#f1f3f4] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-[#202124] text-lg google-font-heading">
                Manage Category Budgets
              </h3>
              <p className="text-xs text-[#5f6368]">
                Total monthly allocation: <strong className="text-[#1a73e8] font-semibold">{totalBudgetCalculated.toLocaleString()} SAR</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#5f6368] hover:text-[#202124] p-1.5 rounded-full hover:bg-[#f1f3f4] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 text-xs font-medium text-[#c5221f] bg-[#fce8e6] border border-[#fad2cf] rounded-xl">
              {error}
            </div>
          )}

          {/* Add / Edit Form */}
          <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-[#f8fafd] border border-[#dadce0] space-y-4">
            <h4 className="text-xs font-semibold text-[#202124]">
              {editingCategory ? `Edit Budget for "${editingCategory.name}"` : 'Add New Category or Adjust Limit'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1.5">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Travel, Gym, Utilities"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!editingCategory}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#dadce0] rounded-xl text-[#202124] focus:outline-none focus:border-[#1a73e8] disabled:bg-[#f1f3f4] disabled:text-[#70757a]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#5f6368] mb-1.5">Monthly Budget (SAR)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    placeholder="e.g. 600"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full pl-3.5 pr-12 py-2 text-xs sm:text-sm font-semibold text-[#202124] bg-white border border-[#dadce0] rounded-xl focus:outline-none focus:border-[#1a73e8]"
                    required
                  />
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-semibold text-[#1a73e8]">
                    SAR
                  </span>
                </div>
              </div>
            </div>

            {/* Color selector */}
            <div>
              <label className="block text-xs font-medium text-[#5f6368] mb-1.5">Color Tag</label>
              <div className="flex items-center gap-2 flex-wrap">
                {PALETTE.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      color === c ? 'scale-125 ring-2 ring-offset-2 ring-offset-[#f8fafd] ring-[#1a73e8]' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-full transition-colors shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>{editingCategory ? 'Update Budget' : 'Save Category'}</span>
              </button>
            </div>
          </form>

          {/* Current Categories List */}
          <div>
            <h4 className="text-xs font-medium text-[#5f6368] mb-2.5">
              Existing Configured Categories ({categories.length})
            </h4>

            <div className="divide-y divide-[#f1f3f4] border border-[#dadce0] rounded-2xl overflow-hidden bg-white">
              {categories.map((cat) => (
                <div key={cat.id || cat.name} className="p-3.5 bg-white flex items-center justify-between gap-3 hover:bg-[#f8fafd] transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color || '#1a73e8' }}
                    />
                    <div>
                      <span className="font-medium text-[#202124] text-sm">{cat.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-xs sm:text-sm text-[#202124]">
                      {cat.budget.toLocaleString()} SAR
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        setName(cat.name);
                        setBudget(cat.budget.toString());
                        setColor(cat.color || PALETTE[0]);
                      }}
                      className="text-xs text-[#1a73e8] hover:underline font-medium px-2.5 py-1 rounded-full hover:bg-[#e8f0fe]"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(cat.name)}
                      className="text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] p-1.5 rounded-full transition-colors"
                      title="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-[#f1f3f4] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
