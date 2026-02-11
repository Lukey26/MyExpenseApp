'use client';
import { formatCurrency } from '@/lib/format';
import type { Transaction, IncomeFrequency } from '@/lib/types';

export default function Summary({ 
  transactions, 
  incomeFrequency 
}: { 
  transactions: Transaction[];
  incomeFrequency?: IncomeFrequency;
}) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  // Calculate period-based averages
  let avgIncome = income;
  let avgExpense = expense;
  let periodLabel = '';

  if (incomeFrequency === 'weekly') {
    // Assuming 4 weeks per month
    avgIncome = income / 4;
    avgExpense = expense / 4;
    periodLabel = ' (Weekly Avg)';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card 
        title={`Income${periodLabel}`} 
        value={formatCurrency(incomeFrequency === 'weekly' ? avgIncome : income)} 
        accent="green" 
      />
      <Card 
        title={`Expenses${periodLabel}`} 
        value={formatCurrency(incomeFrequency === 'weekly' ? avgExpense : expense)} 
        accent="red" 
      />
      <Card 
        title={`Net${periodLabel}`} 
        value={formatCurrency(incomeFrequency === 'weekly' ? (avgIncome - avgExpense) : net)} 
        accent={net >= 0 ? 'blue' : 'orange'} 
      />
    </div>
  );
}

function Card({ title, value, accent }: { title: string; value: string; accent: string }) {
  const border =
    accent === 'green' ? 'border-green-400' :
    accent === 'red' ? 'border-red-400' :
    accent === 'blue' ? 'border-blue-400' :
    'border-orange-400';
  return (
    <div className={`rounded border ${border} p-4 bg-white`}>
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}