import { createContext, useContext, useState, useCallback } from 'react';
import { getStorage, setStorage } from '@/utils/storage';

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(() => {
    return getStorage('sidebar_collapsed') === true;
  });

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      setStorage('sidebar_collapsed', next);
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider value={{ collapsed, toggleSidebar, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
