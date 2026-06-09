import { useAppStore } from '../store/store';
import { Home as HomeIcon, PlusCircle, PieChart, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import React, { useEffect } from 'react';

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeTab, setActiveTab, setSettingsOpen } = useAppStore();
  
  const { settings } = useAppStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Handle notch and safe areas using env() in CSS (assumed configured via Tailwind if needed)
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-[#0A0A0B] text-slate-900 dark:text-white overflow-hidden font-sans">
      <header className="flex-none flex items-center justify-between px-6 pt-12 pb-8 lg:px-12 lg:pt-10 lg:pb-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-shrink-0 items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            {activeTab === 'home' && 'Summary'}
            {activeTab === 'add' && 'Add'}
            {activeTab === 'insights' && 'Insights'}
          </h1>
        </div>
        <button onClick={() => setSettingsOpen(true)} className="p-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-[#161618] transition-colors">
          <Settings size={24} className="text-slate-600 dark:text-neutral-400" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 lg:px-12">
        {children}
      </main>

      <nav className="fixed bottom-0 lg:bottom-6 lg:left-1/2 lg:-translate-x-1/2 lg:w-96 left-0 right-0 h-20 bg-white/80 dark:bg-[#1C1C1E]/80 backdrop-blur-xl border-t border-slate-200 dark:border-[#232325] lg:rounded-3xl lg:border flex items-center justify-around px-6 z-50">
        <NavItem 
          icon={<HomeIcon size={24} />} 
          label="Home" 
          isActive={activeTab === 'home'} 
          onClick={() => setActiveTab('home')} 
        />
        <NavItem 
          icon={<PlusCircle size={32} />} 
          label="Add" 
          isActive={activeTab === 'add'} 
          onClick={() => setActiveTab('add')} 
          center
        />
        <NavItem 
          icon={<PieChart size={24} />} 
          label="Insights" 
          isActive={activeTab === 'insights'} 
          onClick={() => setActiveTab('insights')} 
        />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, isActive, onClick, center }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 transition-all duration-200",
        center ? "-mt-6 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full w-16 h-16 shadow-lg hover:scale-105" : "w-16 h-full text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white",
        isActive && !center && "text-slate-900 dark:text-white font-semibold"
      )}
    >
      {icon}
      {!center && <span className="text-[10px] font-medium mt-1">{label}</span>}
    </button>
  );
}
