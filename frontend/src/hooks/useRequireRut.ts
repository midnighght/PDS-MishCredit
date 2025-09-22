import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/appStore';

export function useRequireRut() {
  const { rut } = useApp();
  const nav = useNavigate();
  useEffect(() => {
    if (!rut) nav('/', { replace: true });
  }, [rut, nav]);
  return rut;
}
