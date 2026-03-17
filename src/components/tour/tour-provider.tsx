'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';
import { useTour, type UseTourReturn } from '@/lib/hooks/use-tour';

const TourContext = createContext<UseTourReturn | null>(null);

export function TourProvider({ children }: { children: ReactNode }) {
  const tour = useTour();

  return (
    <TourContext.Provider value={tour}>{children}</TourContext.Provider>
  );
}

export function useTourContext(): UseTourReturn {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTourContext must be used within a <TourProvider>');
  }
  return ctx;
}
