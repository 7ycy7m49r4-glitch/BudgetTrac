import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

interface Category {
  id: string;
  name: string;
  budget: number;
  color: string;
}

interface Expense {
  id: string;
  serialNo: number;
  date: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod?: string;
  createdAt: string;
  notes?: string;
}

interface BackendAuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  affectedCount: number;
}

interface DatabaseState {
  categories: Category[];
  expenses: Expense[];
  auditLogs: BackendAuditLog[];
  lastUpdated: string;
  currency: string;
}

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial state as per user specification:
// Grocery 600, Food 600, Rent 2250, others 150, electricity 200, investment 500, kl expenses 1800, shopping 300
const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Grocery', budget: 600, color: '#10B981' }, // Emerald
  { id: 'cat-2', name: 'Food', budget: 600, color: '#F59E0B' }, // Amber
  { id: 'cat-3', name: 'Rent', budget: 2250, color: '#6366F1' }, // Indigo
  { id: 'cat-4', name: 'Electricity', budget: 200, color: '#06B6D4' }, // Cyan
  { id: 'cat-5', name: 'Investment', budget: 500, color: '#3B82F6' }, // Blue
  { id: 'cat-6', name: 'KL Expenses', budget: 1800, color: '#8B5CF6' }, // Purple
  { id: 'cat-7', name: 'Shopping', budget: 300, color: '#EC4899' }, // Pink
  { id: 'cat-8', name: 'Others', budget: 150, color: '#64748B' }, // Slate
];

const initialExpenses: Expense[] = [
  // Previous Month (August 2026 Archive)
  { id: 'exp-aug-1', serialNo: 1, date: '2026-08-26', category: 'Rent', description: 'August Apartment Rent', amount: 2250, paymentMethod: 'Bank Transfer', createdAt: '2026-08-26T09:00:00.000Z' },
  { id: 'exp-aug-2', serialNo: 2, date: '2026-08-27', category: 'Grocery', description: 'Carrefour August Pantry Restock', amount: 560, paymentMethod: 'Card', createdAt: '2026-08-27T14:20:00.000Z' },
  { id: 'exp-aug-3', serialNo: 3, date: '2026-08-28', category: 'Electricity', description: 'SEC Power Utility Bill (August)', amount: 195, paymentMethod: 'Mada', createdAt: '2026-08-28T16:00:00.000Z' },
  { id: 'exp-aug-4', serialNo: 4, date: '2026-08-30', category: 'Food', description: 'Al Romansiah Family Dinner', amount: 380, paymentMethod: 'Card', createdAt: '2026-08-30T20:30:00.000Z' },
  { id: 'exp-aug-5', serialNo: 5, date: '2026-08-31', category: 'Investment', description: 'Monthly SIP Investment', amount: 500, paymentMethod: 'Bank Transfer', createdAt: '2026-08-31T11:00:00.000Z' },

  // Current Month (September 2026 Active Cycle)
  { id: 'exp-1', serialNo: 6, date: '2026-09-01', category: 'Rent', description: 'Monthly Apartment Rent', amount: 2250, paymentMethod: 'Bank Transfer', createdAt: '2026-09-01T09:00:00.000Z' },
  { id: 'exp-2', serialNo: 7, date: '2026-09-01', category: 'Electricity', description: 'SEC Power Utility Bill', amount: 185, paymentMethod: 'Mada', createdAt: '2026-09-01T10:15:00.000Z' },
  { id: 'exp-3', serialNo: 8, date: '2026-09-01', category: 'Investment', description: 'Mutual Fund SIP Transfer', amount: 500, paymentMethod: 'Bank Transfer', createdAt: '2026-09-01T11:00:00.000Z' },
  { id: 'exp-4', serialNo: 9, date: '2026-09-02', category: 'Grocery', description: 'Lulu Hypermarket Monthly Staples', amount: 240, paymentMethod: 'Card', createdAt: '2026-09-02T14:20:00.000Z' },
  { id: 'exp-5', serialNo: 10, date: '2026-09-02', category: 'Food', description: 'Al Baik Dinner with Colleagues', amount: 55, paymentMethod: 'Card', createdAt: '2026-09-02T20:30:00.000Z' },
  { id: 'exp-6', serialNo: 11, date: '2026-09-02', category: 'KL Expenses', description: 'Travel & Commute Fare', amount: 320, paymentMethod: 'STC Pay', createdAt: '2026-09-02T21:00:00.000Z' },
  { id: 'exp-7', serialNo: 12, date: '2026-09-03', category: 'Grocery', description: 'Fresh Fruits and Milk', amount: 75, paymentMethod: 'Mada', createdAt: '2026-09-03T08:30:00.000Z' },
  { id: 'exp-8', serialNo: 13, date: '2026-09-03', category: 'Shopping', description: 'Work Attire & Essentials', amount: 120, paymentMethod: 'Card', createdAt: '2026-09-03T12:00:00.000Z' },
  { id: 'exp-9', serialNo: 14, date: '2026-09-03', category: 'Food', description: 'Lunch Express', amount: 35, paymentMethod: 'Cash', createdAt: '2026-09-03T13:15:00.000Z' },
  { id: 'exp-10', serialNo: 15, date: '2026-09-03', category: 'Others', description: 'Mobile Recharge & Data', amount: 60, paymentMethod: 'STC Pay', createdAt: '2026-09-03T14:00:00.000Z' },
];

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialState: DatabaseState = {
      categories: initialCategories,
      expenses: initialExpenses,
      auditLogs: [
        {
          id: 'log-init',
          timestamp: new Date().toISOString(),
          action: 'INIT_DATABASE',
          details: 'Backend initialized with user budget profile (6,400 SAR total) and 10 serial expenses.',
          affectedCount: 10,
        },
      ],
      lastUpdated: new Date().toISOString(),
      currency: 'SAR',
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
  }
}

function readDb(): DatabaseState {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db file, regenerating:', err);
    ensureDataDir();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  }
}

function writeDb(data: DatabaseState): void {
  ensureDataDir();
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function logAudit(db: DatabaseState, action: string, details: string, count: number): void {
  db.auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    action,
    details,
    affectedCount: count,
  });
  // Keep last 100 audit entries
  if (db.auditLogs.length > 100) {
    db.auditLogs = db.auditLogs.slice(0, 100);
  }
}

async function startServer() {
  ensureDataDir();
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // GET all data with monthly breakdown
  app.get('/api/data', (req, res) => {
    const db = readDb();
    const monthQuery = (req.query.month as string) || '';

    const totalMonthlyBudget = db.categories.reduce((acc, cat) => acc + (Number(cat.budget) || 0), 0);

    // Compute distinct months
    const currentMonth = new Date().toISOString().substring(0, 7); // e.g. "2026-09"
    const monthsSet = new Set<string>();
    monthsSet.add(currentMonth);

    // Calculate previous and next months
    const [curY, curM] = currentMonth.split('-').map(Number);
    const prevMonth = curM === 1 ? `${curY - 1}-12` : `${curY}-${String(curM - 1).padStart(2, '0')}`;
    const nextMonth = curM === 12 ? `${curY + 1}-01` : `${curY}-${String(curM + 1).padStart(2, '0')}`;
    monthsSet.add(prevMonth);
    monthsSet.add(nextMonth);

    for (const exp of db.expenses) {
      if (exp.date && exp.date.length >= 7) {
        monthsSet.add(exp.date.substring(0, 7));
      }
    }

    const availableMonths = Array.from(monthsSet).sort().reverse();

    const monthlySummaries = availableMonths.map((m) => {
      const monthExpenses = db.expenses.filter((e) => e.date && e.date.startsWith(m));
      const spent = monthExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      const remaining = totalMonthlyBudget - spent;
      const percentage = totalMonthlyBudget > 0 ? (spent / totalMonthlyBudget) * 100 : 0;

      const [yStr, mStr] = m.split('-');
      const dateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, 1);
      const label = dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

      return {
        month: m,
        label,
        totalBudget: totalMonthlyBudget,
        totalSpent: spent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        expenseCount: monthExpenses.length,
        isCurrentMonth: m === currentMonth,
      };
    });

    // Default or query-filtered summary
    const activeExpenses = monthQuery && monthQuery !== 'all'
      ? db.expenses.filter((e) => e.date && e.date.startsWith(monthQuery))
      : db.expenses;

    const totalBudget = monthQuery && monthQuery !== 'all'
      ? totalMonthlyBudget
      : totalMonthlyBudget; // For all time, can also show total or monthly cap

    const totalSpent = activeExpenses.reduce((acc, exp) => acc + (Number(exp.amount) || 0), 0);
    const remaining = totalBudget - totalSpent;
    const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    res.json({
      currency: db.currency || 'SAR',
      categories: db.categories,
      expenses: db.expenses,
      availableMonths,
      monthlySummaries,
      currentMonth,
      summary: {
        totalBudget,
        totalSpent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        expenseCount: activeExpenses.length,
      },
      lastUpdated: db.lastUpdated,
    });
  });

  // POST single daily log expense
  app.post('/api/expenses', (req, res) => {
    const db = readDb();
    const { date, category, description, amount, paymentMethod, notes, serialNo } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Valid amount in SAR is required' });
    }
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    const nextSerial = serialNo !== undefined && Number(serialNo) > 0
      ? Number(serialNo)
      : (db.expenses.reduce((max, e) => Math.max(max, e.serialNo || 0), 0) + 1);

    const newExpense: Expense = {
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      serialNo: nextSerial,
      date: date || new Date().toISOString().split('T')[0],
      category: String(category).trim(),
      description: description ? String(description).trim() : `${category} expense`,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Card',
      notes: notes || '',
      createdAt: new Date().toISOString(),
    };

    db.expenses.push(newExpense);
    logAudit(db, 'ADD_EXPENSE', `Added daily log #${newExpense.serialNo}: ${newExpense.description} (${newExpense.amount} SAR)`, 1);
    writeDb(db);

    res.status(201).json({ success: true, expense: newExpense, totalExpenses: db.expenses.length });
  });

  // POST bulk-add 10-15 expenses
  app.post('/api/expenses/bulk', (req, res) => {
    const db = readDb();
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    let currentMaxSerial = db.expenses.reduce((max, e) => Math.max(max, e.serialNo || 0), 0);
    const addedExpenses: Expense[] = [];

    for (const item of items) {
      const amt = Number(item.amount);
      if (isNaN(amt) || amt <= 0) continue;

      currentMaxSerial += 1;
      const serial = item.serialNo ? Number(item.serialNo) : currentMaxSerial;

      const newExpense: Expense = {
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        serialNo: serial,
        date: item.date || new Date().toISOString().split('T')[0],
        category: item.category ? String(item.category).trim() : 'Others',
        description: item.description ? String(item.description).trim() : 'Expense entry',
        amount: amt,
        paymentMethod: item.paymentMethod || 'Card',
        notes: item.notes || '',
        createdAt: new Date().toISOString(),
      };

      db.expenses.push(newExpense);
      addedExpenses.push(newExpense);
    }

    logAudit(
      db,
      'BULK_ADD',
      `Bulk added ${addedExpenses.length} expense rows (Serials #${addedExpenses[0]?.serialNo || 1} to #${addedExpenses[addedExpenses.length - 1]?.serialNo || addedExpenses.length}) to backend storage`,
      addedExpenses.length
    );
    writeDb(db);

    res.status(201).json({
      success: true,
      addedCount: addedExpenses.length,
      expenses: addedExpenses,
      totalExpenses: db.expenses.length,
    });
  });

  // PUT update expense
  app.put('/api/expenses/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const index = db.expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const current = db.expenses[index];
    const updated: Expense = {
      ...current,
      date: req.body.date ?? current.date,
      category: req.body.category ?? current.category,
      description: req.body.description ?? current.description,
      amount: req.body.amount !== undefined ? Number(req.body.amount) : current.amount,
      paymentMethod: req.body.paymentMethod ?? current.paymentMethod,
      notes: req.body.notes ?? current.notes,
      serialNo: req.body.serialNo !== undefined ? Number(req.body.serialNo) : current.serialNo,
    };

    db.expenses[index] = updated;
    logAudit(db, 'UPDATE_EXPENSE', `Updated expense #${updated.serialNo} (${updated.amount} SAR)`, 1);
    writeDb(db);

    res.json({ success: true, expense: updated });
  });

  // DELETE expense
  app.delete('/api/expenses/:id', (req, res) => {
    const db = readDb();
    const { id } = req.params;
    const target = db.expenses.find((e) => e.id === id);

    if (!target) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    db.expenses = db.expenses.filter((e) => e.id !== id);
    logAudit(db, 'DELETE_EXPENSE', `Deleted expense #${target.serialNo}: ${target.description} (${target.amount} SAR)`, 1);
    writeDb(db);

    res.json({ success: true, deletedId: id, totalExpenses: db.expenses.length });
  });

  // POST or PUT category budget
  app.post('/api/categories', (req, res) => {
    const db = readDb();
    const { name, budget, color } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    const cleanName = name.trim();
    const existingIndex = db.categories.findIndex((c) => c.name.toLowerCase() === cleanName.toLowerCase());

    const numBudget = Number(budget) || 0;
    const catColor = color || '#3B82F6';

    if (existingIndex >= 0) {
      db.categories[existingIndex].budget = numBudget;
      if (color) db.categories[existingIndex].color = catColor;
      logAudit(db, 'UPDATE_BUDGET', `Updated budget for category ${cleanName} to ${numBudget} SAR`, 1);
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: cleanName,
        budget: numBudget,
        color: catColor,
      };
      db.categories.push(newCat);
      logAudit(db, 'ADD_CATEGORY', `Created new category ${cleanName} with budget ${numBudget} SAR`, 1);
    }

    writeDb(db);
    res.json({ success: true, categories: db.categories });
  });

  // DELETE category
  app.delete('/api/categories/:name', (req, res) => {
    const db = readDb();
    const { name } = req.params;
    const initialLen = db.categories.length;
    db.categories = db.categories.filter((c) => c.name.toLowerCase() !== name.toLowerCase());

    if (db.categories.length === initialLen) {
      return res.status(404).json({ error: 'Category not found' });
    }

    logAudit(db, 'DELETE_CATEGORY', `Removed category: ${name}`, 1);
    writeDb(db);
    res.json({ success: true, categories: db.categories });
  });

  // GET raw backend data & database inspection
  app.get('/api/backend/raw', (req, res) => {
    const db = readDb();
    const stats = fs.existsSync(DB_FILE) ? fs.statSync(DB_FILE) : null;

    res.json({
      databasePath: DB_FILE,
      databaseSizeBytes: stats ? stats.size : 0,
      totalCategories: db.categories.length,
      totalExpenses: db.expenses.length,
      totalAuditLogs: db.auditLogs.length,
      lastUpdated: db.lastUpdated,
      rawDatabase: db,
      serverMetrics: {
        uptimeSeconds: Math.floor(process.uptime()),
        memoryUsage: process.memoryUsage(),
        nodeVersion: process.version,
        platform: process.platform,
      },
    });
  });

  // POST reset data
  app.post('/api/reset', (req, res) => {
    const initialState: DatabaseState = {
      categories: initialCategories,
      expenses: initialExpenses,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'RESET',
          details: 'Restored initial budgeting configuration and serial sample entries.',
          affectedCount: initialExpenses.length,
        },
      ],
      lastUpdated: new Date().toISOString(),
      currency: 'SAR',
    };
    writeDb(initialState);
    res.json({ success: true, state: initialState });
  });

  // Vite middleware for dev or static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
