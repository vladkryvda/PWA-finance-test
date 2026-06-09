export type Currency = 'UAH' | 'GBP' | 'EUR';
export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType | 'both';
}

export interface Transaction {
  id: string;
  createdAt: number;
  updatedAt: number;
  type: TransactionType;
  category: string;
  amount: number;
  currency: Currency;
  exchangeRate: number;
  amountUAH: number;
  date: number; 
  note: string;
  deleted: boolean;
  syncStatus: 'synced' | 'pending' | 'error';
}

export interface SyncLog {
  id: string;
  timestamp: number;
  status: 'success' | 'error';
  message: string;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
  baseCurrency: Currency;
  gsyncConfigured: boolean;
  gsyncUrl: string;
}
