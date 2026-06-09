import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfMonth, endOfMonth, isSameDay, subDays, format } from 'date-fns';
import { formatCurrency, DEFAULT_CATEGORIES } from '../lib/utils';
import { ArrowUpRight, ArrowDownRight, TrendingDown } from 'lucide-react';

export function HomePage() {
  const now = new Date();
  const start = startOfMonth(now).getTime();
  const end = endOfMonth(now).getTime();

  const transactions = useLiveQuery(
    () => db.transactions.where('date').between(start, end).toArray(),
    []
  );

  const recentTransactions = useLiveQuery(
    () => db.transactions.orderBy('date').reverse().limit(10).toArray(),
    []
  );

  if (!transactions) return <div className="animate-pulse h-full flex items-center justify-center">Loading...</div>;

  const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amountUAH, 0);
  const expenses = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amountUAH, 0);
  const saved = income - expenses;

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 lg:grid-rows-6 gap-6 pb-24 animate-in fade-in duration-500 h-full">
      
      {/* Monthly Summary */}
      <div className="col-span-1 lg:col-span-5 lg:row-span-3 bg-[#161618] rounded-[32px] p-8 border border-[#232325] shadow-2xl flex flex-col justify-between">
         <div>
           <p className="text-neutral-500 font-medium mb-1">Available/Saved</p>
           <h2 className="text-6xl text-white font-bold tracking-tight mb-8">{formatCurrency(saved, 'UAH')}</h2>
         </div>
         <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Income</p>
                <p className="text-2xl font-semibold text-emerald-400">{formatCurrency(income, 'UAH')}</p>
              </div>
              <div className="w-32 h-1 bg-[#232325] rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full w-[100%]"></div>
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">Expenses</p>
                <p className="text-2xl font-semibold text-rose-400">{formatCurrency(expenses, 'UAH')}</p>
              </div>
              <div className="w-32 h-1 bg-[#232325] rounded-full overflow-hidden">
                <div className="bg-rose-400 h-full" style={{ width: expenses > 0 ? `${Math.min(100, (expenses/income)*100)}%` : '0%' }}></div>
              </div>
            </div>
         </div>
      </div>

      {/* Heatmap Activity Bento */}
      <div className="col-span-1 lg:col-span-7 lg:row-span-3 bg-[#161618] text-white rounded-[32px] p-8 border border-[#232325] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Spending Pulse</h3>
          <span className="text-xs text-neutral-500 font-mono">ACTIVITY</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Heatmap transactions={transactions} />
        </div>
      </div>

      {/* Main Insight Bento */}
      <div className="col-span-1 lg:col-span-4 lg:row-span-3 bg-gradient-to-br from-indigo-600 to-blue-700 text-white rounded-[32px] p-8 flex flex-col justify-between">
        <svg className="w-10 h-10 text-white/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        <div>
          <h4 className="text-3xl font-bold mb-3 leading-tight">You spent 14% less than last month.</h4>
          <p className="text-white/70 font-medium">Excellent progress. Consider cooking at home this weekend to balance it out.</p>
        </div>
      </div>

      {/* Recent Transactions Bento */}
      <div className="col-span-1 lg:col-span-8 lg:row-span-3 bg-[#161618] rounded-[32px] p-8 border border-[#232325] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg text-white font-semibold tracking-tight">Recent Transactions</h3>
        </div>
        <div className="space-y-2 flex-1 overflow-y-auto">
          {recentTransactions?.map(tx => {
             const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.category);
             
             // Dynamic color for category icon
             let colorClass = "bg-neutral-800 text-neutral-400";
             if (cat?.icon === 'pizza') colorClass = "bg-orange-500/10 text-orange-500";
             if (cat?.icon === 'briefcase' || cat?.icon === 'laptop') colorClass = "bg-blue-500/10 text-blue-500";
             if (cat?.icon === 'film') colorClass = "bg-purple-500/10 text-purple-500";
             if (cat?.icon === 'shopping-bag') colorClass = "bg-rose-500/10 text-rose-500";
             if (cat?.icon === 'bus') colorClass = "bg-cyan-500/10 text-cyan-500";
             
             return (
               <div key={tx.id} className="flex items-center justify-between p-2 hover:bg-[#1C1C1E] rounded-2xl transition-colors">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${colorClass}`}>
                      {cat?.icon === 'pizza' && '🍕'}
                      {cat?.icon === 'bus' && '🚌'}
                      {cat?.icon === 'shopping-bag' && '🛍️'}
                      {cat?.icon === 'briefcase' && '💼'}
                      {cat?.icon === 'laptop' && '💻'}
                      {(!cat || !['pizza', 'bus', 'shopping-bag', 'briefcase', 'laptop'].includes(cat.icon)) && '💸'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{cat?.name || 'Other'} {tx.note && <span className="font-normal text-neutral-400 ml-1">({tx.note})</span>}</p>
                      <p className="text-xs text-neutral-500 uppercase tracking-wide">{format(tx.date, 'MMM d, HH:mm')}</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className={`text-lg font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </p>
                 </div>
               </div>
             )
          })}
          {recentTransactions?.length === 0 && (
             <p className="text-neutral-500 text-center py-6">No recent transactions</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Heatmap({ transactions }: { transactions: any[] }) {
  // Generate last 60 days
  const today = new Date();
  const days = Array.from({ length: 60 }).map((_, i) => subDays(today, 59 - i));
  
  // bucket by day
  const maxExpenses = 5000; // rough baseline for completely dark color

  return (
    <div className="grid grid-flow-col grid-rows-7 gap-1.5 opacity-90 h-full max-h-40 overflow-x-auto pb-2">
      {days.map((day, i) => {
        const dayTx = transactions.filter(t => isSameDay(new Date(t.date), day) && t.type === 'expense');
        const dayTotal = dayTx.reduce((acc, t) => acc + t.amountUAH, 0);
        
        // Intensity 0 to 4
        let intensity = 0;
        if (dayTotal > 0) intensity = 1;
        if (dayTotal > 500) intensity = 2;
        if (dayTotal > 1500) intensity = 3;
        if (dayTotal > 3000) intensity = 4;

        let bgClass = "bg-[#2C2C2E]";
        if (intensity === 1) bgClass = "bg-emerald-900";
        if (intensity === 2) bgClass = "bg-emerald-700";
        if (intensity === 3) bgClass = "bg-emerald-500";
        if (intensity === 4) bgClass = "bg-emerald-400";

        return (
          <div 
            key={i} 
            className={`w-4 h-4 rounded-sm ${bgClass} transition-colors cursor-pointer hover:ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#161618]`}
            title={`${format(day, 'MMM d')}: ${formatCurrency(dayTotal, 'UAH')}`}
          />
        );
      })}
    </div>
  );
}
