// lib/fx.ts
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
  serverTimestamp,
  updateDoc,

} from 'firebase/firestore';
import { db } from './firebase';
import type { Transaction } from './types';

const COL = 'transactions';

// Small utility to drop undefined values
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out as T;
}

export async function listTransactions(userId: string, month: string): Promise<Transaction[]> {
  const q = query(
    collection(db, COL),
    where('userId', '==', userId),
    where('month', '==', month),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Transaction, 'id'>) })) as Transaction[];
}

export async function createTransaction(
  tx: Omit<Transaction, 'id' | 'createdAt'>
) {
  // Explicitly remove `id` if present and strip undefineds
  const { id, createdAt, ...rest } = tx as any;
  const clean = stripUndefined({
    ...rest,
    createdAt: serverTimestamp(), // let Firestore set this
  });

  const ref = await addDoc(collection(db, COL), clean);
  return ref.id;
}

export async function deleteTransactionById(id: string) {
  await deleteDoc(doc(db, COL, id));
}

export async function updateTransaction(
    id: string,
    updates: Partial<Omit<Transaction, 'id' | 'userId' | 'month' | 'createdAt'>>
) {
  const clean = stripUndefined(updates);
  for (const [k,v] of Object.entries(updates)) {
    if (v === undefined) delete clean[k];
  }
  await updateDoc(doc(db, COL, id), clean);
}