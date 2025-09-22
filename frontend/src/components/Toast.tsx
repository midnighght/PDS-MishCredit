import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastItem = { id: number; type: 'success' | 'error' | 'info'; message: string };

type ToastContextValue = {
  toast: (m: { type?: ToastItem['type']; message: string }) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const toast = useCallback((m: { type?: ToastItem['type']; message: string }) => {
    const id = Date.now() + Math.random();
    const item: ToastItem = { id, type: m.type || 'info', message: m.message };
    setItems((prev) => [...prev, item]);
    setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== id)), 3500);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 bottom-4 z-50 space-y-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`min-w-[240px] px-4 py-3 rounded shadow text-sm text-white ${
              t.type === 'success' ? 'bg-green-600' : t.type === 'error' ? 'bg-red-600' : 'bg-slate-800'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider');
  return ctx.toast;
}

