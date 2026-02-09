'use client';

import { useMemo, useState } from 'react';

const ALL_CATEGORIES = [
  'Salary', 'Freelance', 'Food', 'Transport', 'Bills',
  'Entertainment', 'Health', 'Shopping', 'Other'
];

export default function BudgetEditor({
  initialCategories,
  onCancel,
  onSave,
}: {
  initialCategories: Record<string, number>;
  onCancel: () => void;
  onSave: (next: Record<string, number>) => Promise<void>;
}) {
  // Make a local mutable copy
  const [rows, setRows] = useState<{category: string; limit: string}[]>(
    Object.entries(initialCategories).map(([c, v]) => ({ category: c, limit: String(v) }))
  );
  const [newCat, setNewCat] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const available = useMemo(
    () => ALL_CATEGORIES.filter(c => !rows.some(r => r.category === c)),
    [rows]
  );

  const addRow = () => {
    if (!newCat) return;
    setRows(prev => [...prev, { category: newCat, limit: '0' }]);
    setNewCat('');
  };

  const removeRow = (idx: number) => {
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate and build map
    const map: Record<string, number> = {};
    for (const r of rows) {
      if (!r.category) continue;
      const n = Number(r.limit);
      if (isNaN(n) || n < 0) {
        setError(`Budget for "${r.category}" must be a non‑negative number.`);
        return;
      }
      map[r.category] = n;
    }

    setSaving(true);
    try {
      await onSave(map);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="bg-red-50 text-red-700 p-2 rounded text-sm">{error}</div>}

      <div className="space-y-2">
        {rows.length === 0 && (
          <div className="text-sm theme-muted">No budgets yet. Add a category below.</div>
        )}
        {rows.map((r, idx) => (
          <div key={r.category} className="grid grid-cols-[1fr_140px_auto] gap-2 items-center">
            <div className="text-sm">{r.category}</div>
            <input
              type="number"
              step="0.01"
              className="border rounded px-2 py-1"
              style={{ backgroundColor: 'rgb(var(--card))', color: 'rgb(var(--fg))', borderColor: 'rgb(var(--border))' }}
              value={r.limit}
              onChange={(e) => {
                const v = e.target.value;
                setRows(prev => prev.map((row, i) => i === idx ? { ...row, limit: v } : row));
              }}
            />
            <button type="button" onClick={() => removeRow(idx)} className="text-red-600 hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <select
          className="border rounded px-2 py-1"
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          style={{ backgroundColor: 'rgb(var(--card))', color: 'rgb(var(--fg))', borderColor: 'rgb(var(--border))' }}
        >
          <option value="">Add category…</option>
          {available.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <button type="button" onClick={addRow} className="px-3 py-1 rounded theme-accent">Add</button>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded border theme-border">Cancel</button>
        <button type="submit" disabled={saving} className="px-3 py-1 rounded theme-accent">
          {saving ? 'Saving…' : 'Save budgets'}
        </button>
      </div>
    </form>
  );
}