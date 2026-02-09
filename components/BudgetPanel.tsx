'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Transaction } from '@/lib/types';
import type { BudgetDoc } from '@/lib/types';
import { getBudget, saveBudget } from '@/lib/budgets';
import BudgetEditor from './BudgetEditor';
import Modal from './Modal';
import { formatCurrency } from '@/lib/format';

export default function BudgetPanel({
  userId,
  month,
  transactionsForMonth, // all tx for month (not filtered by type/category)
  currency = 'USD',
}: {
  userId: string;
  month: string;                  // 'YYYY-MM'
  transactionsForMonth: Transaction[];
  currency?: string;
}) {
  const [budget, setBudget] = useState<BudgetDoc | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load budget
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      const b = await getBudget(userId, month);
      if (mounted) { setBudget(b ?? { categories: {}, currency }); setLoading(false); }
    };
    run();
    return () => { mounted = false; };
  }, [userId, month, currency]);

  // Spend per category (expenses only)
  const spentByCat = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of transactionsForMonth) {
      if (t.type !== 'expense') continue;
      map[t.category] = (map[t.category] ?? 0) + t.amount;
    }
    return map;
  }, [transactionsForMonth]);

  const hasBudgets = !!budget && Object.keys(budget.categories ?? {}).length > 0;

  const handleSave = async (next: Record<string, number>) => {
    await saveBudget(userId, month, next, budget?.currency);
    setBudget(prev => ({ ...(prev ?? { categories: {} }), categories: next }));
    setOpen(false);
  };

  if (loading) {
    return <div className="text-sm theme-muted">Loading budgets…</div>;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Budgets — {month}</h3>
        <button className="px-3 py-1 rounded theme-accent" onClick={() => setOpen(true)}>
          {hasBudgets ? 'Edit budgets' : 'Add budgets'}
        </button>
      </div>

      {!hasBudgets ? (
        <p className="text-sm theme-muted">No budgets set for this month.</p>
      ) : (
        <div className="space-y-3">
          {Object.entries(budget!.categories).map(([cat, limit]) => {
            const spent = spentByCat[cat] ?? 0;
            const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : (spent > 0 ? 100 : 0);
            const over = spent > limit && limit > 0;

            return (
              <div key={cat} className="p-3 rounded border theme-border" style={{ backgroundColor: 'rgb(var(--card))' }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm">{cat}</div>
                  <div className="text-sm">
                    {formatCurrency(spent, currency)} / {formatCurrency(limit, currency)}
                  </div>
                </div>
                <div className="h-2 w-full rounded bg-gray-200" style={{ backgroundColor: 'rgb(var(--border))' }}>
                  <div
                    className="h-2 rounded"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: over ? 'rgb(var(--neg))' : 'rgb(var(--accent))',
                    }}
                    title={`${pct}%`}
                  />
                </div>
                {over && (
                  <div className="text-xs mt-1" style={{ color: 'rgb(var(--neg))' }}>
                    Over budget by {formatCurrency(spent - limit, currency)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={open} title={`Budgets for ${month}`} onClose={() => setOpen(false)}>
        <BudgetEditor
          initialCategories={budget?.categories ?? {}}
          onCancel={() => setOpen(false)}
          onSave={handleSave}
        />
      </Modal>
    </section>
  );
}