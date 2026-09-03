import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Check, Sparkles, FileText, Table, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Category } from '../types';

interface BulkAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  startSerialNo: number;
  selectedMonth?: string;
  onBulkAddExpenses: (items: Array<{
    serialNo?: number;
    date: string;
    category: string;
    description: string;
    amount: number;
    paymentMethod?: string;
    notes?: string;
  }>) => Promise<boolean>;
}

interface GridRow {
  id: string;
  serialNo: number;
  date: string;
  category: string;
  description: string;
  amount: string;
  paymentMethod: string;
}

export const BulkAddModal: React.FC<BulkAddModalProps> = ({
  isOpen,
  onClose,
  categories,
  startSerialNo,
  selectedMonth,
  onBulkAddExpenses,
}) => {
  const [tab, setTab] = useState<'grid' | 'paste' | 'upload'>('grid');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');

  // Generate initial 12 rows (between 10 and 15) for the interactive grid
  const createInitialRows = (start: number, count: number = 12): GridRow[] => {
    const today = new Date().toISOString().split('T')[0];
    let rowDate = today;
    if (selectedMonth && selectedMonth !== 'all') {
      rowDate = today.startsWith(selectedMonth) ? today : `${selectedMonth}-01`;
    }

    const defaultCat = categories[0]?.name || 'Grocery';
    return Array.from({ length: count }, (_, idx) => ({
      id: `row-${idx + 1}-${Date.now()}`,
      serialNo: start + idx,
      date: rowDate,
      category: categories[idx % categories.length]?.name || defaultCat,
      description: '',
      amount: '',
      paymentMethod: idx % 2 === 0 ? 'Mada' : 'Card',
    }));
  };

  const [gridRows, setGridRows] = useState<GridRow[]>(() => createInitialRows(startSerialNo, 12));

  // Reset or update when opening
  React.useEffect(() => {
    if (isOpen) {
      setGridRows(createInitialRows(startSerialNo, 12));
      setError('');
    }
  }, [isOpen, startSerialNo, selectedMonth]);

  if (!isOpen) return null;

  // Handle grid updates
  const handleRowChange = (id: string, field: keyof GridRow, value: any) => {
    setGridRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addMoreRows = (count: number) => {
    const lastSerial = gridRows.length > 0 ? gridRows[gridRows.length - 1].serialNo : startSerialNo;
    const newRows = createInitialRows(lastSerial + 1, count);
    setGridRows((prev) => [...prev, ...newRows]);
  };

  const removeRow = (id: string) => {
    if (gridRows.length <= 1) return;
    setGridRows((prev) => prev.filter((row) => row.id !== id));
  };

  // Pre-fill realistic sample batch of 12 serial items tailored to user's categories
  const fillSampleBatch = () => {
    const today = new Date().toISOString().split('T')[0];
    const sampleItems = [
      { cat: 'Grocery', desc: 'Tamimi Fresh Produce & Dairy', amt: '165', method: 'Mada' },
      { cat: 'Food', desc: 'Express Lunch Shawarma & Juice', amt: '38', method: 'Cash' },
      { cat: 'Shopping', desc: 'Sports Gear & Running Socks', amt: '110', method: 'Card' },
      { cat: 'Grocery', desc: 'Organic Olive Oil & Spices', amt: '85', method: 'Mada' },
      { cat: 'KL Expenses', desc: 'Metro Train Pass & Commute', amt: '140', method: 'STC Pay' },
      { cat: 'Electricity', desc: 'Extra Cooling Meter Charge', amt: '45', method: 'Bank Transfer' },
      { cat: 'Food', desc: 'Traditional Mandi Feast with Family', amt: '92', method: 'Card' },
      { cat: 'Others', desc: 'Home Hardware & Cleaning Supplies', amt: '55', method: 'Mada' },
      { cat: 'Investment', desc: 'Auto-Invest Micro Saving', amt: '100', method: 'Bank Transfer' },
      { cat: 'Shopping', desc: 'Bookstore & Work Supplies', amt: '65', method: 'Card' },
      { cat: 'Grocery', desc: 'Weekend Bakery & Fresh Bread', amt: '40', method: 'Cash' },
      { cat: 'KL Expenses', desc: 'Airport Express Shuttle', amt: '120', method: 'STC Pay' },
    ];

    setGridRows(
      sampleItems.map((s, idx) => ({
        id: `row-sample-${idx}`,
        serialNo: startSerialNo + idx,
        date: today,
        category: s.cat,
        description: s.desc,
        amount: s.amt,
        paymentMethod: s.method,
      }))
    );
  };

  // Submit grid rows
  const handleGridSubmit = async () => {
    setError('');
    const validItems = gridRows
      .filter((row) => {
        const amt = parseFloat(row.amount);
        return !isNaN(amt) && amt > 0;
      })
      .map((row) => ({
        serialNo: row.serialNo,
        date: row.date,
        category: row.category,
        description: row.description.trim() || `${row.category} item`,
        amount: parseFloat(row.amount),
        paymentMethod: row.paymentMethod,
      }));

    if (validItems.length === 0) {
      setError('Please fill in at least 1 valid row with an amount greater than 0 SAR.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onBulkAddExpenses(validItems);
      if (success) {
        onClose();
      } else {
        setError('Backend failed to process bulk batch.');
      }
    } catch (err: any) {
      setError(err?.message || 'Error occurred during bulk add');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Parse raw text (10-15 lines)
  const handleParseText = async () => {
    setError('');
    if (!rawText.trim()) {
      setError('Please paste your list of expenses');
      return;
    }

    const lines = rawText.split('\n').filter((l) => l.trim().length > 0);
    const parsedList: Array<{
      serialNo?: number;
      date: string;
      category: string;
      description: string;
      amount: number;
      paymentMethod?: string;
    }> = [];

    const today = new Date().toISOString().split('T')[0];
    let autoSerial = startSerialNo;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Check if line starts with serial number like "1." or "#1" or "1,"
      let extractedSerial = autoSerial;
      let cleanLine = line;
      const serialMatch = line.match(/^#?(\d+)[\.\,\:\s\-]/);
      if (serialMatch) {
        extractedSerial = parseInt(serialMatch[1]);
        cleanLine = line.substring(serialMatch[0].length).trim();
      }

      // Try pipe or comma separation: Date | Category | Desc | Amount | Method
      let parts = cleanLine.split(/[|,\t]/).map((p) => p.trim());
      let date = today;
      let cat = 'Others';
      let desc = '';
      let amt = 0;
      let method = 'Card';

      if (parts.length >= 3) {
        // Find amount part
        for (let p of parts) {
          const num = parseFloat(p.replace(/[^0-9.]/g, ''));
          if (!isNaN(num) && num > 0 && !amt) {
            amt = num;
          } else if (p.match(/^\d{4}-\d{2}-\d{2}$/)) {
            date = p;
          } else if (categories.some((c) => c.name.toLowerCase() === p.toLowerCase())) {
            cat = categories.find((c) => c.name.toLowerCase() === p.toLowerCase())?.name || p;
          } else if (!desc) {
            desc = p;
          }
        }
      } else {
        // Fallback simple line like "Grocery 150 Carrefour" or "150 Grocery"
        const amtMatch = line.match(/(\d+(?:\.\d+)?)\s*(?:sar|riyal)?/i);
        if (amtMatch) {
          amt = parseFloat(amtMatch[1]);
        }
        for (const c of categories) {
          if (line.toLowerCase().includes(c.name.toLowerCase())) {
            cat = c.name;
            break;
          }
        }
        desc = line.replace(/(\d+(?:\.\d+)?)\s*(?:sar|riyal)?/gi, '').trim();
      }

      if (amt > 0) {
        parsedList.push({
          serialNo: extractedSerial,
          date,
          category: cat,
          description: desc || `${cat} expense`,
          amount: amt,
          paymentMethod: method,
        });
        autoSerial = Math.max(autoSerial + 1, extractedSerial + 1);
      }
    }

    if (parsedList.length === 0) {
      setError('Could not extract valid expenses. Check the format and ensure amounts in SAR are provided.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onBulkAddExpenses(parsedList);
      if (success) {
        onClose();
      } else {
        setError('Backend failed to save parsed list.');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to submit parsed expenses');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle CSV/Text File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        setTab('paste');
      }
    };
    reader.readAsText(file);
  };

  // Calculate totals in grid
  const validGridRowsCount = gridRows.filter((r) => parseFloat(r.amount) > 0).length;
  const gridTotalSAR = gridRows.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#202124]/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-xl border border-[#dadce0] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-white border-b border-[#f1f3f4] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e8f0fe] border border-[#d2e3fc] text-[#1a73e8] flex items-center justify-center font-bold">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-[#202124] text-lg google-font-heading">
                  Bulk-Add Expenses (10-15 Items)
                </h3>
                <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-[#e8f0fe] text-[#1a73e8] border border-[#d2e3fc]">
                  Serial Number Entry
                </span>
              </div>
              <p className="text-xs text-[#5f6368]">
                Add 10 to 15 serial expense logs in one batch directly into backend storage
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

        {/* Mode Tabs in Google Segmented Control */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#f1f3f4] bg-[#f8fafd] flex-shrink-0">
          <div className="flex items-center gap-2 bg-[#f1f3f4] p-1 rounded-full border border-[#dadce0]">
            <button
              onClick={() => setTab('grid')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === 'grid'
                  ? 'bg-white text-[#1a73e8] shadow-2xs font-semibold'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Serial Grid ({gridRows.length})</span>
            </button>

            <button
              onClick={() => setTab('paste')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === 'paste'
                  ? 'bg-white text-[#1a73e8] shadow-2xs font-semibold'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste 10-15 Lines</span>
            </button>

            <button
              onClick={() => setTab('upload')}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                tab === 'upload'
                  ? 'bg-white text-[#1a73e8] shadow-2xs font-semibold'
                  : 'text-[#5f6368] hover:text-[#202124]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>File Upload</span>
            </button>
          </div>

          {tab === 'grid' && (
            <button
              type="button"
              onClick={fillSampleBatch}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] rounded-full transition-colors"
              title="Preload 12 sample serial expenses for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#1a73e8]" />
              <span>Load 12 Ready Samples</span>
            </button>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-3 p-3 text-xs font-medium text-[#c5221f] bg-[#fce8e6] border border-[#fad2cf] rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {tab === 'grid' && (
            <div>
              <div className="flex items-center justify-between text-xs text-[#5f6368] mb-2 font-medium">
                <div>
                  Enter 10 to 15 expenses in sequence. Consecutive serial numbers are pre-assigned.
                </div>
                <div className="text-[#202124]">
                  Filled: <span className="text-[#1a73e8] font-semibold">{validGridRowsCount} rows</span> | Subtotal: <span className="text-[#1a73e8] font-semibold">{gridTotalSAR.toFixed(2)} SAR</span>
                </div>
              </div>

              {/* Grid Table in Google Sheets Style */}
              <div className="border border-[#dadce0] rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#f8fafd] sticky top-0 z-10 text-[#5f6368] font-medium text-xs border-b border-[#dadce0]">
                      <tr>
                        <th className="py-2.5 px-3 w-16 text-center">S.No</th>
                        <th className="py-2.5 px-3 w-32">Date</th>
                        <th className="py-2.5 px-3 w-36">Category</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3 w-32">Amount (SAR)</th>
                        <th className="py-2.5 px-3 w-32">Method</th>
                        <th className="py-2.5 px-3 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f3f4] bg-white">
                      {gridRows.map((row) => (
                        <tr key={row.id} className="hover:bg-[#f8fafd] transition-colors">
                          {/* S.No */}
                          <td className="p-2 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[#e8f0fe] text-[#1a73e8]">
                              #{row.serialNo.toString().padStart(3, '0')}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="p-1.5">
                            <input
                              type="date"
                              value={row.date}
                              onChange={(e) => handleRowChange(row.id, 'date', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-[#f8fafd] border border-[#dadce0] rounded-lg text-[#202124] focus:bg-white focus:border-[#1a73e8] focus:outline-none"
                            />
                          </td>

                          {/* Category */}
                          <td className="p-1.5">
                            <select
                              value={row.category}
                              onChange={(e) => handleRowChange(row.id, 'category', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-[#f8fafd] border border-[#dadce0] rounded-lg text-[#202124] focus:bg-white focus:border-[#1a73e8] focus:outline-none font-medium"
                            >
                              {categories.map((c) => (
                                <option key={c.id || c.name} value={c.name}>
                                  {c.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Description */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              placeholder="e.g. Supermarket grocery"
                              value={row.description}
                              onChange={(e) => handleRowChange(row.id, 'description', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-[#f8fafd] border border-[#dadce0] rounded-lg text-[#202124] placeholder:text-[#70757a] focus:bg-white focus:border-[#1a73e8] focus:outline-none"
                            />
                          </td>

                          {/* Amount */}
                          <td className="p-1.5">
                            <div className="relative">
                              <input
                                type="number"
                                step="any"
                                min="0"
                                placeholder="0.00"
                                value={row.amount}
                                onChange={(e) => handleRowChange(row.id, 'amount', e.target.value)}
                                className="w-full pl-2.5 pr-8 py-1.5 text-xs font-semibold text-[#202124] bg-[#f8fafd] border border-[#dadce0] rounded-lg focus:bg-white focus:border-[#1a73e8] focus:outline-none"
                              />
                              <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-[11px] text-[#1a73e8] font-semibold">
                                SAR
                              </span>
                            </div>
                          </td>

                          {/* Payment Method */}
                          <td className="p-1.5">
                            <select
                              value={row.paymentMethod}
                              onChange={(e) => handleRowChange(row.id, 'paymentMethod', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs bg-[#f8fafd] border border-[#dadce0] rounded-lg text-[#202124] focus:bg-white focus:border-[#1a73e8] focus:outline-none"
                            >
                              <option value="Mada">Mada</option>
                              <option value="Card">Card</option>
                              <option value="STC Pay">STC Pay</option>
                              <option value="Cash">Cash</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                          </td>

                          {/* Delete row */}
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeRow(row.id)}
                              className="text-[#5f6368] hover:text-[#d93025] hover:bg-[#fce8e6] p-1.5 rounded-full transition-colors"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer Controls */}
                <div className="p-3 bg-[#f8fafd] border-t border-[#dadce0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => addMoreRows(1)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#dadce0] hover:bg-[#f1f3f4] font-medium text-[#202124]"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span>+1 Row</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addMoreRows(3)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#dadce0] hover:bg-[#f1f3f4] font-medium text-[#202124]"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#1a73e8]" />
                      <span>+3 Rows (to 15)</span>
                    </button>
                  </div>

                  <span className="text-[#5f6368] text-xs">
                    Tip: Press Tab to move across cells
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === 'paste' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-[#5f6368]">
                <span className="font-medium">Paste 10-15 lines of serial expenses:</span>
                <span className="text-[#70757a]">Format: S.No | Category | Description | Amount SAR</span>
              </div>

              <textarea
                rows={10}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Example format:\n1. 2026-09-01 | Grocery | Hypermarket vegetables | 145 | Mada\n2. 2026-09-01 | Food | Grilled Chicken Lunch | 42 | Card\n3. 2026-09-02 | Shopping | Footwear | 180 | STC Pay\n4. 2026-09-02 | KL Expenses | Train ticket | 65 | Card\n5. 2026-09-03 | Electricity | Extra Meter Bill | 90 | Bank Transfer\n...\n15. 2026-09-03 | Others | Hardware repairs | 35 | Cash`}
                className="w-full p-3.5 font-mono text-xs text-[#202124] bg-[#f8fafd] border border-[#dadce0] rounded-2xl focus:outline-none focus:border-[#1a73e8] focus:bg-white placeholder:text-[#70757a]"
              />

              <div className="p-3.5 rounded-2xl bg-[#e8f0fe] border border-[#d2e3fc] text-xs text-[#1a73e8]">
                <p className="font-medium text-[#1a73e8]">Smart Parser:</p>
                <p className="mt-0.5 text-[#3c4043]">
                  Automatically extracts serial numbers, matches your configured categories (Grocery, Food, Rent, Electricity, Investment, KL Expenses, Shopping, Others), and computes SAR amounts.
                </p>
              </div>
            </div>
          )}

          {tab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-[#dadce0] rounded-3xl p-8 text-center hover:border-[#1a73e8] hover:bg-[#f8fafd] transition-all">
                <FileSpreadsheet className="w-12 h-12 text-[#1a73e8] mx-auto mb-3" />
                <h4 className="text-sm font-medium text-[#202124] mb-1 google-font-heading">
                  Upload CSV or Spreadsheet File (10-15 Serial Entries)
                </h4>
                <p className="text-xs text-[#5f6368] mb-4 max-w-sm mx-auto">
                  Drag and drop your spreadsheet export, bank list, or serial expense text file
                </p>
                <label className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] rounded-full cursor-pointer shadow-xs transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>Choose File to Upload</span>
                  <input
                    type="file"
                    accept=".csv,.txt,.json,.tsv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="text-xs text-[#5f6368] bg-[#f8fafd] p-3.5 rounded-2xl border border-[#dadce0]">
                <span className="font-medium text-[#202124] block mb-1">CSV Header Template:</span>
                <code className="text-[#1a73e8] font-mono">serialNo,date,category,description,amount,paymentMethod</code>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-white border-t border-[#f1f3f4] flex items-center justify-between flex-shrink-0">
          <div className="text-xs text-[#5f6368]">
            {tab === 'grid' && (
              <span>
                Ready to commit: <strong className="text-[#202124]">{validGridRowsCount} rows</strong> (<span className="text-[#1a73e8] font-medium">{gridTotalSAR.toFixed(2)} SAR</span>)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#5f6368] hover:text-[#202124] hover:bg-[#f1f3f4] rounded-full transition-colors"
            >
              Cancel
            </button>

            {tab === 'grid' ? (
              <button
                type="button"
                onClick={handleGridSubmit}
                disabled={isSubmitting || validGridRowsCount === 0}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 active:scale-98 rounded-full shadow-xs transition-all"
              >
                {isSubmitting ? (
                  <span>Saving to Backend...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save {validGridRowsCount} Entries to Backend</span>
                  </>
                )}
              </button>
            ) : tab === 'paste' ? (
              <button
                type="button"
                onClick={handleParseText}
                disabled={isSubmitting || !rawText.trim()}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#1a73e8] hover:bg-[#1557b0] disabled:opacity-50 active:scale-98 rounded-full shadow-xs transition-all"
              >
                {isSubmitting ? (
                  <span>Parsing & Saving...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Parse & Save Lines to Backend</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
