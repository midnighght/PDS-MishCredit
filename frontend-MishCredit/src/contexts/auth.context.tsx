/**
 *
 *
 * Auth context interface defining available methods
 */
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { authReducer, initialAuthState } from '../reducers/auth.reducer';
import authService from '../services/auth.service';
import { STORAGE_KEYS } from '../../constants';
import type { AuthState, UserData } from '../types/auth.types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
/**
 * Auth context for managing authentication state across the application
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth provider component that waprs the application
 * Manages authentication state and provides auth methods to children
 *
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  /**
   *
   * initialize auth state from local storage on component mount
   */
  useEffect(() => {
    // This should only run once when component mounts
    // to restore user session from localStorage
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (storedUser) {
        const userData: UserData = JSON.parse(storedUser);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { ...userData, email: userData.email || '' },
        });
      }
    } catch (error) {
      console.error('Failed to load user data from storage:', error);
      // clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    }
  }, []); // empty array ==> renderer just once

  /**
   * Login function that authenticates user with UCN API
   * @param email - User's email
   * @param password - User's password
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      dispatch({ type: 'LOGIN_START' });
      try {
        const loginResponse = await authService.login(email, password);
        const userData: UserData = {
          rut: loginResponse.rut,
          email,
          carreras: loginResponse.carreras,
        };
        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { ...loginResponse, email },
        });
      } catch (error) {
        dispatch({
          type: 'LOGIN_ERROR',
          payload: error instanceof Error ? error.message : 'Login failed',
        });
      }
    },
    [],
  );

  /**
   *
   *
   * Logout function that clears authentication state
   */
  const logout = useCallback((): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);
  /**
   * Clear error messages from state
   */
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);
  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
/**
 * Custom hook to use auth context
 * @retuns Auth context value
 * @throws Error is used outside AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
