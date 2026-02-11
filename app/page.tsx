'use client';

import { useEffect, useMemo, useState } from 'react';
import TransactionForm from '@/components/TransactionForm';
import Filters from '@/components/Filters';
import Summary from '@/components/Summary';
import TransactionList from '@/components/TransactionList';
import AuthBar from '@/components/AuthBar';
import Modal from '@/components/Modal';
import EditTransactionForm from '@/components/EditTransactionForm';
import MonthlyInsights from '@/components/MonthlyInsights';

import BudgetPanel from '@/components/BudgetPanel';

import { useLocalStorage } from '@/lib/storage';
import type { Transaction, FiltersState, UserPreferences } from '@/lib/types';
import { getMonthKey } from '@/lib/format';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { createTransaction, deleteTransactionById, listTransactions, updateTransaction } from '@/lib/fx';

const CATEGORIES = [
  'Salary', 'Freelance', 'Food', 'Transport', 'Bills',
  'Entertainment', 'Health', 'Shopping', 'Other',
];

export default function HomePage() {
  const [localTransactions, setLocalTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('userPreferences', {
    incomeFrequency: 'monthly',
    currency: 'USD'
  });
  const [user, setUser] = useState<User | null>(null);
  const [cloudTransactions, setCloudTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const [filters, setFilters] = useState<FiltersState>(() => ({
    month: new Date().toISOString().slice(0, 7),
    type: 'all',
    category: 'all',
  }));

  // EDIT state
  const [editing, setEditing] = useState<Transaction | null>(null);
  const monthKey = filters.month;
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  useEffect(() => {
    const load = async () => {
      if (!user) { setCloudTransactions([]); return; }
      setLoading(true);
      try {
        const rows = await listTransactions(user.uid, filters.month);
        setCloudTransactions(rows);
      } catch (e: any) {
        // Optional: show a banner if index is building
        console.warn(e?.message ?? e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, filters.month]);

  const transactions = user ? cloudTransactions : localTransactions;

  const addTx = async (
  t: Omit<Transaction, 'id' | 'userId' | 'month' | 'createdAt'> & { id?: string }
) => {
  const month = getMonthKey(t.date);
  if (user) {
    const id = await createTransaction({ ...(t as any), userId: user.uid, month });
    setCloudTransactions(prev => [
      { ...(t as any), id, userId: user.uid, month, createdAt: Date.now() },
      ...prev
    ]);
  } else {
    const draft: Transaction = {
      ...(t as any),
      id: crypto.randomUUID(),
      userId: 'local',
      month,
      createdAt: Date.now(),
    };
    setLocalTransactions(prev => [draft, ...prev]);
  }
};

  const deleteTx = async (id: string) => {
    try {
      if (user) {
        await deleteTransactionById(id);
        setCloudTransactions(prev => prev.filter(x => x.id !== id));
      } else {
        setLocalTransactions(prev => prev.filter(x => x.id !== id));
      }
    } catch (e: any) {
      const msg = e?.code === 'permission-denied'
        ? 'You can only delete your own transactions.'
        : (e?.message ?? 'Delete failed. Please try again.');
      alert(msg);
      console.error(e);
    }
  };

  // EDIT save handler
  const handleEditSave = async (patch: Partial<Transaction>) => {
    if (!editing) return;

    if (user) {
      // Optimistic UI: patch local state first
      setCloudTransactions(prev =>
        prev.map(x => x.id === editing.id ? { ...x, ...patch } as Transaction : x)
      );
      try {
        await updateTransaction(editing.id, patch);
      } catch (e) {
        // Rollback if needed (optional: re-fetch list)
        console.error(e);
        alert('Update failed. Please try again.');
      }
    } else {
      // Local draft mode
      setLocalTransactions(prev =>
        prev.map(x => x.id === editing.id ? { ...x, ...patch } as Transaction : x)
      );
    }
    setEditing(null);
  };

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      return true;
    });
  }, [transactions, filters]);

  // One-time migration (unchanged)
  useEffect(() => {
    const migrate = async () => {
      if (!user || localTransactions.length === 0) return;
      for (const l of localTransactions) {
        const { id: _omit, createdAt: _omit2, ...rest } = l as any;
        await createTransaction({ ...rest, userId: user.uid, month: getMonthKey(l.date) });
      }
      setLocalTransactions([]);
      const rows = await listTransactions(user.uid, filters.month);
      setCloudTransactions(rows);
    };
    migrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6 bg-gray-100 min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Expense Tracker</h1>
          <p className="text-gray-600">Track income and expenses with monthly summaries.</p>
        </div>
        <AuthBar />
      </header>

      <TransactionForm 
        onAdd={addTx as any} 
        preferences={preferences}
        onPreferencesUpdate={setPreferences}
      />
      <Filters value={filters} categories={CATEGORIES} onChange={setFilters} />

      {!mounted ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <SkeletonCard title="Income" />
          <SkeletonCard title="Expenses" />
          <SkeletonCard title="Net" />
        </div>
      ) : loading && user ? (
        <div className="text-sm text-gray-600">Loading transactions…</div>
      ) : (
        <>
          <Summary transactions={filtered} incomeFrequency={preferences.incomeFrequency} />

          {/* Monthly Insights Visualization */}
          <MonthlyInsights 
            transactions={transactions} 
            month={monthKey} 
            incomeFrequency={preferences.incomeFrequency}
          />

          {/* Budgets (use the entire month's transactions, not the filtered subset) */}
            {user && (
              <BudgetPanel
                userId={user.uid}
                month={monthKey}
                transactionsForMonth={transactions}  // contains only the selected month in your current design
                currency="USD" // or "TTD", or read from a future user settings doc
              />
            )}


          <section>
            <h3 className="font-semibold mb-2">Transactions</h3>
            <TransactionList
              transactions={filtered}
              onDelete={deleteTx}
              onEdit={(id: string) => {
                const tx = filtered.find(t => t.id === id);
                if (tx) setEditing({...tx,date: tx.date ?? '',description: tx.description ?? '',});
              }}
            />
          </section>
        </>
      )}

      <Modal
        open={!!editing}
        title="Edit Transaction"
        onClose={() => setEditing(null)}
      >
        {editing && (
          <EditTransactionForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={handleEditSave}
          />
        )}
      </Modal>
    </main>
  );
}

function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="rounded border border-gray-200 p-4 bg-white">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="h-6 w-24 bg-gray-200 rounded mt-1" />
    </div>
  );
}