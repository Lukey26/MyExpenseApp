'use client';
import { useMemo } from 'react';
import { formatCurrency } from '@/lib/format';
import type { Transaction, IncomeFrequency } from '@/lib/types';

interface MonthlyInsightsProps {
  transactions: Transaction[];
  month: string;
  incomeFrequency: IncomeFrequency;
}

const CATEGORY_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
];

export default function MonthlyInsights({ transactions, month, incomeFrequency }: MonthlyInsightsProps) {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const income = transactions.filter(t => t.type === 'income');
    
    // Category breakdown
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
    });
    
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount], idx) => ({
        category,
        amount,
        percentage: 0, // calculated below
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
      }));
    
    const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate percentages
    sortedCategories.forEach(cat => {
      cat.percentage = totalExpense > 0 ? (cat.amount / totalExpense) * 100 : 0;
    });
    
    // Time-based aggregation based on income frequency
    const timeData: Record<string, { income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date + 'T00:00:00'); // Add time to avoid timezone issues
      let timeKey: string;
      
      if (incomeFrequency === 'weekly') {
        // Group by week - use ISO week format to ensure consistency
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        // Include year and month in key to avoid collision across months
        timeKey = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
      } else {
        // Group by month - use the existing month field
        timeKey = t.month || t.date.slice(0, 7); // YYYY-MM
      }
      
      if (!timeData[timeKey]) {
        timeData[timeKey] = { income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        timeData[timeKey].income += t.amount;
      } else {
        timeData[timeKey].expense += t.amount;
      }
    });
    
    const timeArray = Object.entries(timeData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, values]) => ({
        date,
        ...values,
        net: values.income - values.expense
      }));
    
    return {
      categories: sortedCategories,
      totalExpense,
      totalIncome,
      net: totalIncome - totalExpense,
      timeData: timeArray,
    };
  }, [transactions, incomeFrequency]);

  if (data.categories.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Insights</h3>
        <p className="text-gray-500">No expense data available for this month.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Spending by Category - Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          
          <div className="flex flex-col items-center">
            <PieChart categories={data.categories} total={data.totalExpense} />
            
            <div className="mt-6 w-full">
              <div className="bg-gray-100 py-2 px-3 font-semibold text-center rounded mb-3">
                Total Spending: {formatCurrency(data.totalExpense)}
              </div>
              
              <div className="space-y-2">
                {data.categories.map(cat => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span>{cat.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">{cat.percentage.toFixed(0)}%</span>
                      <span className="font-medium w-20 text-right">{formatCurrency(cat.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Income vs Spending - Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Income vs Spending {incomeFrequency === 'weekly' ? '(Weekly)' : '(Monthly)'}
          </h3>
          
          <BarChart timeData={data.timeData} incomeFrequency={incomeFrequency} />
          
          <div className="mt-6">
            <div className="bg-gray-100 py-2 px-3 rounded mb-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded" />
                  <span className="text-sm">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded" />
                  <span className="text-sm">Spending</span>
                </div>
                <span className="text-sm font-semibold">Net</span>
              </div>
            </div>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {data.timeData.map((period, idx) => {
                let periodLabel: string;
                
                if (incomeFrequency === 'weekly') {
                  periodLabel = `Week ${idx + 1}`;
                } else {
                  // For monthly, parse the YYYY-MM format correctly
                  const [year, month] = period.date.split('-');
                  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                  periodLabel = date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    year: 'numeric' 
                  });
                }
                
                return (
                  <div key={period.date} className="grid grid-cols-4 gap-2 text-sm py-1">
                    <span className="text-gray-600">{periodLabel}</span>
                    <span className="text-right">{formatCurrency(period.income)}</span>
                    <span className="text-right">{formatCurrency(period.expense)}</span>
                    <span className={`text-right font-semibold ${period.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(period.net)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PieChart({ categories, total }: { categories: Array<{ category: string; amount: number; percentage: number; color: string }>; total: number }) {
  let currentAngle = -90; // Start from top
  
  const slices = categories.map(cat => {
    const angle = (cat.amount / total) * 360;
    const slice = {
      ...cat,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return slice;
  });

  return (
    <svg viewBox="0 0 200 200" className="w-64 h-64">
      {slices.map((slice, idx) => {
        const largeArc = slice.endAngle - slice.startAngle > 180 ? 1 : 0;
        const startRad = (slice.startAngle * Math.PI) / 180;
        const endRad = (slice.endAngle * Math.PI) / 180;
        
        const x1 = 100 + 90 * Math.cos(startRad);
        const y1 = 100 + 90 * Math.sin(startRad);
        const x2 = 100 + 90 * Math.cos(endRad);
        const y2 = 100 + 90 * Math.sin(endRad);
        
        const pathData = [
          `M 100 100`,
          `L ${x1} ${y1}`,
          `A 90 90 0 ${largeArc} 1 ${x2} ${y2}`,
          `Z`
        ].join(' ');
        
        return (
          <path
            key={slice.category}
            d={pathData}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <title>{slice.category}: {formatCurrency(slice.amount)} ({slice.percentage.toFixed(1)}%)</title>
          </path>
        );
      })}
    </svg>
  );
}

function BarChart({ timeData, incomeFrequency }: { 
  timeData: Array<{ date: string; income: number; expense: number; net: number }>;
  incomeFrequency: IncomeFrequency;
}) {
  if (timeData.length === 0) {
    return <div className="text-gray-500 text-sm text-center py-8">No data available</div>;
  }

  const maxValue = Math.max(...timeData.flatMap(w => [w.income, w.expense]));
  
  return (
    <div className="h-48 flex items-end justify-around gap-2 border-b border-l border-gray-200 pb-2 pl-2">
      {timeData.map((period, idx) => {
        const incomeHeight = maxValue > 0 ? (period.income / maxValue) * 100 : 0;
        const expenseHeight = maxValue > 0 ? (period.expense / maxValue) * 100 : 0;
        
        let label: string;
        if (incomeFrequency === 'weekly') {
          label = `W${idx + 1}`;
        } else {
          // For monthly, parse YYYY-MM correctly
          const [year, month] = period.date.split('-');
          const date = new Date(parseInt(year), parseInt(month) - 1, 1);
          label = date.toLocaleDateString('en-US', { month: 'short' });
        }
        
        return (
          <div key={period.date} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end justify-center gap-1 h-40">
              <div 
                className="flex-1 bg-green-500 rounded-t hover:bg-green-600 transition-colors cursor-pointer"
                style={{ height: `${incomeHeight}%`, minHeight: incomeHeight > 0 ? '4px' : '0' }}
                title={`Income: ${formatCurrency(period.income)}`}
              />
              <div 
                className="flex-1 bg-red-500 rounded-t hover:bg-red-600 transition-colors cursor-pointer"
                style={{ height: `${expenseHeight}%`, minHeight: expenseHeight > 0 ? '4px' : '0' }}
                title={`Spending: ${formatCurrency(period.expense)}`}
              />
            </div>
            <span className="text-xs text-gray-600">{label}</span>
          </div>
        );
      })}
    </div>
  );
}
