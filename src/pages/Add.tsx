import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { parseTransactionInput, formatCurrency, EXCHANGE_RATES, DEFAULT_CATEGORIES } from '../lib/utils';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../store/store';

export function AddPage() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<any>(null);
  const { setActiveTab } = useAppStore();

  useEffect(() => {
    if (input.trim().length > 2) {
      const result = parseTransactionInput(input);
      setParsed(result);
    } else {
      setParsed(null);
    }
  }, [input]);

  const handleSave = async () => {
    if (!parsed) return;

    const rate = EXCHANGE_RATES[parsed.currency] || 1;
    const amountUAH = parsed.amount * rate;

    await db.transactions.add({
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      type: parsed.type,
      category: parsed.category,
      amount: parsed.amount,
      currency: parsed.currency as any,
      exchangeRate: rate,
      amountUAH,
      date: Date.now(),
      note: parsed.note,
      deleted: false,
      syncStatus: 'pending',
    });

    setInput('');
    setParsed(null);
    setActiveTab('home');
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <div className="text-center mb-12">
        <h2 className="text-slate-500 dark:text-zinc-400 text-sm font-medium tracking-widest uppercase mb-2">New Transaction</h2>
        <p className="text-3xl font-light text-slate-800 dark:text-slate-200">
          What did you spend on?
        </p>
      </div>

      <div className="relative mb-8">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Food 500"
          className="w-full bg-transparent text-4xl sm:text-5xl border-b-2 border-slate-200 dark:border-[#232325] pb-4 outline-none font-medium text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-neutral-700 transition-colors focus:border-slate-800 dark:focus:border-white"
          autoFocus
        />
      </div>

      {parsed && (
        <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-[#232325] animate-in slide-in-from-bottom-8 fade-in flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-[#2C2C2E] flex items-center justify-center text-2xl">
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'pizza' && '🍕'}
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'bus' && '🚌'}
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'shopping-bag' && '🛍️'}
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'film' && '🍿'}
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'plane' && '✈️'}
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'briefcase' && '💼'}
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'heart' && '❤️'}
                 {DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon === 'file-text' && '📄'}
                 {!['pizza', 'bus', 'shopping-bag', 'film', 'plane', 'briefcase', 'heart', 'file-text'].includes(DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.icon || '') && '💰'}
              </div>
              <div>
                <p className="font-semibold text-lg dark:text-white">{DEFAULT_CATEGORIES.find(c => c.id === parsed.category)?.name}</p>
                <p className="text-slate-500 text-sm capitalize">{parsed.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold dark:text-white">{formatCurrency(parsed.amount, parsed.currency)}</p>
              {parsed.currency !== 'UAH' && (
                <p className="text-slate-500 text-sm">≈ {formatCurrency(parsed.amount * EXCHANGE_RATES[parsed.currency], 'UAH')}</p>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full bg-slate-900 dark:bg-white text-white dark:text-black rounded-2xl py-4 font-semibold text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <CheckCircle2 size={24} />
            Save Transaction
          </button>
        </div>
      )}
    </div>
  );
}
