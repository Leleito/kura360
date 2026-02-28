'use client';

import { createContext, useContext, useState, type ReactNode, type Dispatch, type SetStateAction } from 'react';

interface LayoutState {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
  mobileSearch: boolean;
  setMobileSearch: Dispatch<SetStateAction<boolean>>;
}

const LayoutContext = createContext<LayoutState | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);

  return (
    <LayoutContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen, mobileSearch, setMobileSearch }}
    >
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within a LayoutProvider');
  return ctx;
}
