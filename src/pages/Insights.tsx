import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { startOfMonth, subMonths, format, startOfWeek, subWeeks, isSameMonth } from 'date-fns';
import { formatCurrency, DEFAULT_CATEGORIES } from '../lib/utils';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function InsightsPage() {
  const allTx = useLiveQuery(() => db.transactions.toArray(), []);

  if (!allTx) return <div className="animate-pulse flex h-full items-center justify-center">Loading...</div>;

  const now = new Date();
  const thisMonthStart = startOfMonth(now).getTime();
  const lastMonthStart = startOfMonth(subMonths(now, 1)).getTime();

  const thisMonthTx = allTx.filter(t => t.date >= thisMonthStart);
  const lastMonthTx = allTx.filter(t => t.date >= lastMonthStart && t.date < thisMonthStart);

  const thisMonthExpenses = thisMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amountUAH, 0);
  const lastMonthExpenses = lastMonthTx.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amountUAH, 0);

  let differenceStr = "0%";
  if (lastMonthExpenses > 0) {
    const diff = ((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100;
    differenceStr = `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`;
  }

  // Category breakdown this month
  const catTotals = thisMonthTx
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amountUAH;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(catTotals)
    .map(([catId, amount]) => {
      const cat = DEFAULT_CATEGORIES.find(c => c.id === catId);
      return {
        name: cat?.name || 'Other',
        amount,
        color: cat?.color || '#ccc'
      };
    })
    .sort((a, b) => b.amount - a.amount);
    
  const topCategory = chartData[0];

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Intelligence</h2>

      <div className="flex flex-col gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#161618] border border-slate-100 dark:border-[#232325] rounded-3xl p-6 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-2">Month over Month</p>
          <p className="text-2xl font-semibold leading-tight text-slate-800 dark:text-white">
            You spent <span className="text-indigo-600 dark:text-emerald-400">{differenceStr}</span> compared to last month.
          </p>
        </div>

        {/* Card 2 */}
        {topCategory && (
          <div className="bg-white dark:bg-[#161618] border border-slate-100 dark:border-[#232325] rounded-3xl p-6 shadow-sm">
            <p className="text-slate-500 text-sm font-medium mb-2">Largest Drain</p>
            <p className="text-2xl font-semibold leading-tight text-slate-800 dark:text-white">
              <span style={{ color: topCategory.color }}>{topCategory.name}</span> accounts for {((topCategory.amount / thisMonthExpenses) * 100).toFixed(0)}% of expenses.
            </p>
          </div>
        )}

      </div>

      <div>
         <h3 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">Category Breakdown</h3>
         <div className="bg-white dark:bg-[#161618] rounded-3xl p-6 border border-slate-100 dark:border-[#232325] shadow-sm">
            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 0, left: 30, bottom: 0 }}>
                   <XAxis type="number" hide />
                   <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} 
                      tick={{ fill: '#888', fontSize: 12 }} />
                   <Tooltip 
                     cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                     formatter={(val: number) => formatCurrency(val, 'UAH')}
                   />
                   <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={24}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>
    
      <div className="bg-indigo-600 text-white rounded-3xl p-6">
        <h3 className="font-semibold text-xl mb-2">Monthly Report</h3>
        <p className="opacity-80 mb-6 text-sm">Download your full financial breakdown for {format(now, 'MMMM yyyy')}</p>
        <button className="bg-white text-indigo-900 font-semibold py-3 px-6 rounded-xl w-full">
          Generate Report
        </button>
      </div>

    </div>
  );
}

// Temporary shim for YAxis since I forgot to import it
import { YAxis } from 'recharts';
