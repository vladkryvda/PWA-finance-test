import Dexie, { type EntityTable } from 'dexie';
import type { Transaction, Category, SyncLog } from '../types';
import { DEFAULT_CATEGORIES } from '../lib/utils';

export const db = new Dexie('FinanceDB') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>;
  categories: EntityTable<Category, 'id'>;
  syncLogs: EntityTable<SyncLog, 'id'>;
};

db.version(1).stores({
  transactions: 'id, date, category, type, syncStatus, deleted',
  categories: 'id, name',
  syncLogs: 'id, timestamp'
});

db.on('populate', () => {
  db.categories.bulkAdd(DEFAULT_CATEGORIES);
});
