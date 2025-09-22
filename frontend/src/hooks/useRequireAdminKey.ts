import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/appStore';

export function useRequireAdminKey() {
  const { adminKey } = useApp();
  const nav = useNavigate();
  useEffect(() => {
    if (!adminKey) nav('/admin', { replace: true });
  }, [adminKey, nav]);
  return adminKey;
}

