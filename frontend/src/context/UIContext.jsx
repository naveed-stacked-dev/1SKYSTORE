import { createContext, useContext, useState, useCallback } from 'react';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [globalLoading, setGlobalLoading] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, content: null, title: '' });

  const openModal = useCallback(({ title = '', content = null }) => {
    setModal({ isOpen: true, content, title });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, content: null, title: '' });
  }, []);

  return (
    <UIContext.Provider
      value={{
        globalLoading,
        setGlobalLoading,
        modal,
        openModal,
        closeModal,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
}
