'use client';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Transaction } from '@/lib/types';

export default function TransactionList({
  transactions,
  onDelete,
  onEdit,
}: {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  if (transactions.length === 0) return <p className="text-sm text-gray-600">No transactions to show.</p>;

  return (
    <div className="overflow-x-auto rounded border bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <Th>Date</Th><Th>Type</Th><Th>Category</Th><Th>Description</Th><Th className="text-right">Amount</Th><Th></Th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} className="border-t">
              <Td>{formatDate(t.date)}</Td>
              <Td><span className={t.type === 'income' ? 'text-green-700' : 'text-red-700'}>{t.type}</span></Td>
              <Td>{t.category}</Td>
              <Td>{t.description ?? '—'}</Td>
              <Td className="text-right">{formatCurrency(t.amount)}</Td>
              <Td className="text-right">
                <button onClick={() => onEdit(t.id)} className="text-blue-600 hover:underline mr-2">Edit</button>
                <button onClick={() => onDelete(t.id)} className="text-red-600 hover:underline">Delete</button>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children, className = '' }: any) { return <th className={`px-3 py-2 text-left font-medium ${className}`}>{children}</th>; }
function Td({ children, className = '' }: any) { return <td className={`px-3 py-2 align-top ${className}`}>{children}</td>; }