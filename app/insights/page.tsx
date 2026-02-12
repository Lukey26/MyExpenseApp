'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import MonthlyInsights from '@/components/MonthlyInsights';
import Summary from '@/components/Summary';
import Filters from '@/components/Filters';
import AuthBar from '@/components/AuthBar';

import { useLocalStorage } from '@/lib/storage';
import type { Transaction, FiltersState, UserPreferences } from '@/lib/types';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { listTransactions } from '@/lib/fx';

const CATEGORIES = [
  'Salary', 'Freelance', 'Food', 'Transport', 'Bills',
  'Entertainment', 'Health', 'Shopping', 'Other',
];

export default function InsightsPage() {
  const router = useRouter();
  const [localTransactions, setLocalTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [preferences] = useLocalStorage<UserPreferences>('userPreferences', {
    incomeFrequency: 'monthly',
    currency: 'USD'
  });
  const [user, setUser] = useState<User | null>(null);
  const [cloudTransactions, setCloudTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [filters, setFilters] = useState<FiltersState>(() => ({
    month: new Date().toISOString().slice(0, 7),
    type: 'all',
    category: 'all',
  }));

  useEffect(() => setMounted(true), []);
  useEffect(() => onAuthStateChanged(auth, (u) => setUser(u)), []);

  useEffect(() => {
    const load = async () => {
      if (!user) { setCloudTransactions([]); return; }
      setLoading(true);
      try {
        const rows = await listTransactions(user.uid, filters.month);
        setCloudTransactions(rows);
      } catch (e: any) {
        console.warn(e?.message ?? e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, filters.month]);

  const transactions = user ? cloudTransactions : localTransactions;

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.category !== 'all' && t.category !== filters.category) return false;
      return true;
    });
  }, [transactions, filters]);

  return (
    <main className="max-w-4xl mx-auto p-4 space-y-6 bg-gray-100 min-h-screen">
      <header className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Transactions
          </button>
          <h1 className="text-2xl font-bold">Insights & Analytics</h1>
          <p className="text-gray-600">Visualize your spending patterns and trends.</p>
        </div>
        <AuthBar />
      </header>

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
          <MonthlyInsights 
            transactions={transactions} 
            month={filters.month} 
            incomeFrequency={preferences.incomeFrequency}
          />
        </>
      )}
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
