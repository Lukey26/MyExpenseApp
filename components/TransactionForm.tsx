'use client';

import { useState } from 'react';
import type { Transaction, TxType } from '@/lib/types';

const CATEGORIES = [
  'Salary', 'Freelance', 'Food', 'Transport', 'Bills',
  'Entertainment', 'Health', 'Shopping', 'Other',
];

export default function TransactionForm({
  onAdd,
}: {
  // Emit a *creation payload*, not a full Transaction with server/derived fields
  onAdd: (t: Omit<Transaction, 'id' | 'userId' | 'month' | 'createdAt'>) => void;
}) {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<string[]>([]);

  const validate = () => {
    const errs: string[] = [];
    const amt = Number(amount);
    if (!amount || isNaN(amt) || amt <= 0) errs.push('Amount must be a positive number.');
    if (!date) errs.push('Date is required.');
    if (new Date(date) > new Date()) errs.push('Date cannot be in the future.');
    if (!category) errs.push('Category is required.');
    setErrors(errs);
    return errs.length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Build only the fields the form truly owns.
    // The page-level add handler will add: id/userId/month/createdAt.
    const tx: Omit<Transaction, 'id' | 'userId' | 'month' | 'createdAt'> = {
      type,
      amount: Number(amount),
      category,
      description: description.trim(), // can be '' (caller can map '' -> null if desired)
      date, // 'YYYY-MM-DD'
    };

    onAdd(tx);

    // Reset some fields (your call which to reset)
    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={submit} className="rounded border p-4 space-y-3 bg-white">
      <h3 className="font-semibold text-lg">Add Transaction</h3>

      {errors.length > 0 && (
        <ul className="bg-red-50 text-red-700 p-2 rounded text-sm">
          {errors.map((e) => (
            <li key={e}>• {e}</li>
          ))}
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
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div>
          <label className="block text-sm">Date</label>
          <input
            type="date"
            className="w-full border rounded p-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm">Category</label>
          <select
            className="w-full border rounded p-2"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Description (optional)</label>
          <input
            className="w-full border rounded p-2"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Lunch with client"
          />
        </div>
      </div>

      <button
        type="submit"
        className="bg-black text-white rounded px-4 py-2 hover:opacity-90"
      >
        Add
      </button>
    </form>
  );
}