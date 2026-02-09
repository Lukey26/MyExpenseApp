'use client';
import type { FiltersState, TxType } from '@/lib/types';

export default function Filters({
  value,
  categories,
  onChange,
}: {
  value: FiltersState;
  categories: string[];
  onChange: (next: FiltersState) => void;
}) {
  const set = (patch: Partial<FiltersState>) => onChange({ ...value, ...patch });
  return (
    <div className="rounded border p-4 bg-white grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="block text-sm">Month</label>
        <input type="month" className="w-full border rounded p-2"
          value={value.month} onChange={(e) => set({ month: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm">Type</label>
        <select className="w-full border rounded p-2"
          value={value.type} onChange={(e) => set({ type: e.target.value as 'all' | TxType })}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>
      <div>
        <label className="block text-sm">Category</label>
        <select className="w-full border rounded p-2"
          value={value.category} onChange={(e) => set({ category: e.target.value as any })}>
          <option value="all">All</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );
}