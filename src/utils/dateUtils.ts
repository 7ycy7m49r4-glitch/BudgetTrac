export function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatMonthLabel(yyyyMm: string): string {
  if (!yyyyMm || yyyyMm === 'all') return 'All Time';
  const [yearStr, monthStr] = yyyyMm.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const date = new Date(year, month, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getPreviousMonth(yyyyMm: string): string {
  if (yyyyMm === 'all') return getCurrentMonth();
  const [yearStr, monthStr] = yyyyMm.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) - 1; // 0-indexed
  if (month === 0) {
    month = 12;
    year -= 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getNextMonth(yyyyMm: string): string {
  if (yyyyMm === 'all') return getCurrentMonth();
  const [yearStr, monthStr] = yyyyMm.split('-');
  let year = parseInt(yearStr, 10);
  let month = parseInt(monthStr, 10) + 1; // 1-12
  if (month === 13) {
    month = 1;
    year += 1;
  }
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function getDistinctMonths(dates: string[]): string[] {
  const set = new Set<string>();
  const current = getCurrentMonth();
  set.add(current);

  // Add next month for forward planning
  set.add(getNextMonth(current));

  // Add previous month as reference
  set.add(getPreviousMonth(current));

  for (const d of dates) {
    if (d && d.length >= 7) {
      set.add(d.substring(0, 7));
    }
  }

  // Sort descending (latest month first)
  return Array.from(set).sort().reverse();
}
