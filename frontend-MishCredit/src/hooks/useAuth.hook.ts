import { useAuthContext } from '../contexts/auth.context';

export const useAuth = () => {
  return useAuthContext();
};