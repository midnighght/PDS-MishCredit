import React, { createContext, useContext } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Carrera = { codigo: string; nombre: string; catalogo: string };
export type Seleccion = { codCarrera: string; catalogo: string } | null;

type AppContextShape = {
  rut: string;
  setRut: (v: string) => void;
  carreras: Carrera[];
  setCarreras: (v: Carrera[]) => void;
  seleccion: Seleccion;
  setSeleccion: (v: Seleccion) => void;
  tope: number;
  setTope: (n: number) => void;
  period: string;
  setPeriod: (v: string) => void;
  adminKey: string;
  setAdminKey: (v: string) => void;
};

const AppContext = createContext<AppContextShape | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [rut, setRut] = useLocalStorage<string>('rut', '');
  const [carreras, setCarreras] = useLocalStorage<Carrera[]>('carreras', []);
  const [seleccion, setSeleccion] = useLocalStorage<Seleccion>('seleccion', null);
  const [tope, setTope] = useLocalStorage<number>('tope', 22);
  const [period, setPeriod] = useLocalStorage<string>('period', '202520');
  const [adminKey, setAdminKey] = useLocalStorage<string>('adminKey', '');

  const value: AppContextShape = {
    rut,
    setRut,
    carreras,
    setCarreras,
    seleccion,
    setSeleccion,
    tope,
    setTope,
    period,
    setPeriod,
    adminKey,
    setAdminKey,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp debe usarse dentro de AppProvider');
  return ctx;
}

