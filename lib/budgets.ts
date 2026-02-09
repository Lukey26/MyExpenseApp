import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { BudgetDoc } from './types';

export async function getBudget(uid: string, month: string): Promise<BudgetDoc | null> {
  const ref = doc(db, 'budgets', uid, 'months', month);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as any;
  return {
    categories: data.categories ?? {},
    currency: data.currency ?? undefined,
    updatedAt: data.updatedAt ? data.updatedAt.toMillis?.() ?? data.updatedAt : undefined,
  };
}

export async function saveBudget(
  uid: string,
  month: string,
  categories: Record<string, number>,
  currency?: string
) {
  const ref = doc(db, 'budgets', uid, 'months', month);
  // Merge so you can add/remove categories over time
  await setDoc(
    ref,
    { categories, currency: currency ?? null, updatedAt: serverTimestamp() },
    { merge: true }
  );
}