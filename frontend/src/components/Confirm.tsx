import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Options = { title?: string; description?: string; okText?: string; cancelText?: string };
type Ctx = { confirm: (opts: Options) => Promise<boolean> };

const ConfirmContext = createContext<Ctx | undefined>(undefined);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Options>({});
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: Options) => {
    setOpts(o);
    setOpen(true);
    return new Promise<boolean>((resolve) => setResolver(() => resolve));
  }, []);

  const close = (v: boolean) => {
    setOpen(false);
    if (resolver) resolver(v);
    setResolver(null);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => close(false)} />
          <div className="relative bg-white rounded shadow-lg w-full max-w-md p-5">
            <h3 className="text-lg font-semibold">{opts.title || 'Confirmar'}</h3>
            {opts.description && <p className="mt-2 text-sm text-gray-700">{opts.description}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-2 rounded bg-gray-100 hover:bg-gray-200" onClick={() => close(false)}>
                {opts.cancelText || 'Cancelar'}
              </button>
              <button className="btn" onClick={() => close(true)}>{opts.okText || 'Aceptar'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return ctx.confirm;
}

