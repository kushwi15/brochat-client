import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  sidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  isGuestLimitModalOpen: boolean;
  setGuestLimitModalOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme });
      },
      sidebarOpen: false,
      setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
      isGuestLimitModalOpen: false,
      setGuestLimitModalOpen: (open) => set({ isGuestLimitModalOpen: open }),
    }),
    {
      name: 'app-storage',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
);
