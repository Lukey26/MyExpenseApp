// components/EditTransactionForm.tsx
'use client';

import { useState } from 'react';
import type { Transaction, TxType } from '@/lib/types';
import { getMonthKey } from '@/lib/format';

const CATEGORIES = [
  'Salary', 'Food', 'Transport', 'Bills',
  'Entertainment', 'Health', 'Shopping', 'Other'
];

export default function EditTransactionForm({
  initial,
  onCancel,
  onSave,
}: {
  initial: Transaction;
  onCancel: () => void;
  onSave: (patch: Partial<Transaction>) => Promise<void>;
}) {
  // 🔒 Normalize all incoming values to defined strings
  const normalized = {
    type: (initial.type ?? 'expense') as TxType,
    amount: initial.amount ?? 0,
    category: initial.category ?? CATEGORIES[0],
    description: initial.description ?? '',
    date: initial.date ?? '', // empty string keeps it controlled
  };

  const [type, setType] = useState<TxType>(normalized.type);
  const [amount, setAmount] = useState<string>(String(normalized.amount));
  const [category, setCategory] = useState<string>(normalized.category);
  const [description, setDescription] = useState<string>(normalized.description);
  const [date, setDate] = useState<string>(normalized.date);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) errs.push('Amount must be a positive number.');
    if (!date) errs.push('Date is required.');
    if (date && new Date(date) > new Date()) errs.push('Date cannot be in the future.');
    if (!category) errs.push('Category is required.');
    setErrors(errs);
    return errs.length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const patch: Partial<Transaction> = {
        type,
        amount: Number(amount),
        category,
        description: description.trim() === '' ? null : description.trim(), // send null, not undefined
        date,
        month: getMonthKey(date),
      };
      await onSave(patch);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      {errors.length > 0 && (
        <ul className="bg-red-50 text-red-700 p-2 rounded text-sm">
          {errors.map((e) => <li key={e}>• {e}</li>)}
        </ul>
      )}

      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="expense"
            checked={type === 'expense'}
            onChange={() => setType('expense')}
          />
          Expense
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="type"
            value="income"
            checked={type === 'income'}
            onChange={() => setType('income')}
          />
          Income
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm">Amount</label>
          <input
            type="number"
            step="0.01"
            className="w-full border rounded p-2"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}   // always string
          />
        </div>

        <div>
          <label className="block text-sm">Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={date}                 // always string ('' if not set)
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm">Category</label>
          <select
            className="w-full border rounded p-2"
            value={category}             // always string
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm">Description (optional)</label>
          <input
            className="w-full border rounded p-2"
            value={description}          // always string
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Lunch with client"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-1 rounded border">Cancel</button>
        <button type="submit" disabled={saving} className="px-3 py-1 rounded bg-blue-600 text-white">
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}