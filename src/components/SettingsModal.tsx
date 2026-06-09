import { useState } from 'react';
import { useAppStore } from '../store/store';
import { X, Moon, Sun, Monitor, Cloud, Download, Trash2 } from 'lucide-react';
import { db } from '../db/db';

export function SettingsModal() {
  const { isSettingsOpen, setSettingsOpen, settings, updateSettings } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isSettingsOpen) return null;

  const handleClearData = async () => {
    if (window.confirm("Are you sure you want to delete all local data?")) {
      await db.transactions.clear();
      alert("Data cleared");
    }
  };

  const handleSync = async () => {
    if (!settings.gsyncUrl) {
      alert("Будь ласка, спочатку вкажіть URL Google Apps Script.");
      return;
    }
    
    setIsSyncing(true);
    try {
      const txs = await db.transactions.toArray();
      
      // We use text/plain to avoid CORS preflight requests
      await fetch(settings.gsyncUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'syncTransactions', transactions: txs })
      });
      
      alert("Дані успішно синхронізовано з Google Sheets!");
    } catch (e: any) {
      console.error("Sync error:", e);
      alert("Помилка синхронізації: " + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-[#0A0A0B] animate-in slide-in-from-bottom-full duration-300">
      <div className="flex items-center justify-between px-6 py-6 border-b border-slate-200 dark:border-[#232325]">
        <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
        <button onClick={() => setSettingsOpen(false)} className="p-2 -mr-2 bg-slate-200 dark:bg-[#1C1C1E] rounded-full dark:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-8">
        
        {/* Theme Settings */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Appearance</h3>
          <div className="flex bg-slate-200 dark:bg-[#1C1C1E] p-1 rounded-2xl gap-1">
            <button 
              onClick={() => updateSettings({ theme: 'light' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${settings.theme === 'light' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm dark:text-white' : 'text-slate-500'}`}
            >
              <Sun size={18} /> Light
            </button>
            <button 
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${settings.theme === 'dark' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm dark:text-white' : 'text-slate-500'}`}
            >
              <Moon size={18} /> Dark
            </button>
            <button 
              onClick={() => updateSettings({ theme: 'system' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${settings.theme === 'system' ? 'bg-white dark:bg-[#2C2C2E] shadow-sm dark:text-white' : 'text-slate-500'}`}
            >
              <Monitor size={18} /> System
            </button>
          </div>
        </section>

        {/* Currency Settings */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Preferences</h3>
          <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200 dark:border-[#232325] overflow-hidden">
             <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-[#232325]">
               <span className="font-medium dark:text-white">Base Currency</span>
               <select 
                 className="bg-transparent font-medium border-none outline-none text-right dark:text-white"
                 value={settings.baseCurrency}
                 onChange={(e) => updateSettings({ baseCurrency: e.target.value as any })}
               >
                 <option value="UAH">UAH (₴)</option>
                 <option value="GBP">GBP (£)</option>
                 <option value="EUR">EUR (€)</option>
               </select>
             </div>
          </div>
        </section>

        {/* Sync Settings */}
        <section>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Google Sheets Sync</h3>
          <div className="bg-white dark:bg-[#161618] rounded-2xl border border-slate-200 dark:border-[#232325] p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full">
                <Cloud size={24} />
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">Sync Engine</p>
                <p className="text-sm text-slate-500 leading-relaxed mt-1">Connect a Google Apps Script URL to securely backup transactions to your private Google Sheet.</p>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="https://script.google.com/macros/s/..."
              value={settings.gsyncUrl}
              onChange={e => updateSettings({ gsyncUrl: e.target.value })}
              className="w-full bg-slate-50 dark:bg-[#0A0A0B] border border-slate-200 dark:border-[#232325] rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-slate-400 dark:text-white"
            />
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold py-3 rounded-xl disabled:opacity-50 transition-opacity"
            >
              {isSyncing ? "Синхронізація..." : "Sync Now"}
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="mb-12">
          <h3 className="text-sm font-semibold text-rose-500 uppercase tracking-wider mb-4">Danger Zone</h3>
          <div className="bg-white dark:bg-[#161618] rounded-2xl border border-rose-100 dark:border-rose-900/30 overflow-hidden">
             <button onClick={handleClearData} className="w-full px-5 py-4 flex items-center gap-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#1C1C1E] transition-colors text-left">
               <Trash2 size={20} />
               <span className="font-medium">Reset Local Data</span>
             </button>
          </div>
        </section>

      </div>
    </div>
  );
}
