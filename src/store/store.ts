import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Settings } from '../types';

interface AppState {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  activeTab: 'home' | 'add' | 'insights';
  setActiveTab: (tab: 'home' | 'add' | 'insights') => void;
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      settings: {
        theme: 'system',
        baseCurrency: 'UAH',
        gsyncConfigured: false,
        gsyncUrl: '',
      },
      updateSettings: (newSettings) => set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
      isSettingsOpen: false,
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    }),
    {
      name: 'finance-app-storage',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
