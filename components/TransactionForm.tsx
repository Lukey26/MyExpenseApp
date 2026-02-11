'use client';

import { useState } from 'react';
import type { Transaction, TxType, UserPreferences, IncomeFrequency } from '@/lib/types';

const CATEGORIES = [
  'Salary', 'Freelance', 'Food', 'Transport', 'Bills',
  'Entertainment', 'Health', 'Shopping', 'Other',
];

export default function TransactionForm({
  onAdd,
  preferences,
  onPreferencesUpdate,
}: {
  // Emit a *creation payload*, not a full Transaction with server/derived fields
  onAdd: (t: Omit<Transaction, 'id' | 'userId' | 'month' | 'createdAt'>) => void;
  preferences: UserPreferences;
  onPreferencesUpdate: (prefs: UserPreferences) => void;
}) {
  const [type, setType] = useState<TxType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);

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

  const handleFrequencyChange = (frequency: IncomeFrequency) => {
    onPreferencesUpdate({ ...preferences, incomeFrequency: frequency });
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
        
        {/* Preferences Toggle */}
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="ml-auto text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </div>

      {/* Preferences Section */}
      {showPreferences && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
          <h4 className="font-medium text-sm">Income Frequency</h4>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleFrequencyChange('weekly')}
              className={`flex-1 px-3 py-2 rounded text-sm border transition-colors ${
                preferences.incomeFrequency === 'weekly'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              Weekly
            </button>
            <button
              type="button"
              onClick={() => handleFrequencyChange('monthly')}
              className={`flex-1 px-3 py-2 rounded text-sm border transition-colors ${
                preferences.incomeFrequency === 'monthly'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
              }`}
            >
              Monthly
            </button>
          </div>
          <p className="text-xs text-gray-500">
            {preferences.incomeFrequency === 'weekly'
              ? 'Charts and summaries will show weekly averages'
              : 'Charts and summaries will show monthly totals'}
          </p>
        </div>
      )}

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