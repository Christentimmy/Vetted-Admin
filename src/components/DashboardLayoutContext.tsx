import { createContext, useContext } from 'react';

interface DashboardLayoutContextValue {
  isInLayout: boolean;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const DashboardLayoutContext = createContext<DashboardLayoutContextValue | null>(null);

export const useDashboardLayout = (): DashboardLayoutContextValue | null => {
  return useContext(DashboardLayoutContext);
};


