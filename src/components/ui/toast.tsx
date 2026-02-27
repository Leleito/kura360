'use client';

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const variantStyles: Record<ToastVariant, string> = {
  success: 'border-l-4 border-l-green bg-white',
  error: 'border-l-4 border-l-red bg-white',
  warning: 'border-l-4 border-l-orange bg-white',
  info: 'border-l-4 border-l-blue bg-white',
};

const variantIcons: Record<ToastVariant, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const variantIconColors: Record<ToastVariant, string> = {
  success: 'text-green',
  error: 'text-red',
  warning: 'text-orange',
  info: 'text-blue',
};

let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = `toast-${++idCounter}`;
    setToasts((prev) => [...prev, { id, message, variant }]);

    // Auto-dismiss after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const Icon = variantIcons[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border border-surface-border px-4 py-3 shadow-lg',
                'animate-[slideIn_200ms_ease-out]',
                variantStyles[t.variant]
              )}
              role="alert"
            >
              <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', variantIconColors[t.variant])} />
              <p className="flex-1 text-sm text-text-primary">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-0.5 rounded text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
