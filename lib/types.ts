export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;   // owner
  type: TxType;
  amount: number;
  category: string;
  description?: string;
  date: string;     // YYYY-MM-DD
  month: string;    // YYYY-MM (derived from date)
  createdAt: number; // Date.now() (could switch to serverTimestamp later)
}

export interface FiltersState {
  month: string;    // 'YYYY-MM'
  type: 'all' | TxType;
  category: 'all' | string;
}

export interface BudgetDoc {
  categories: Record<string, number>; // category -> monthly budget amount
  currency?: string;
  updatedAt?: number;
}