import React, { createContext, useEffect, useReducer, useCallback, type ReactNode } from "react";
import type { AuthContextType } from "../types/auth.types";
import { authReducer, initialAuthState } from "../reducers/auth.reducer";
import { authService } from "../services/auth.service";
import { tokenStorage } from "../utils/storage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [state, dispatch] = useReducer(authReducer, initialAuthState);

    // Initialize auth only once when component mounts
    useEffect(() => {
        const initializeAuth = async () => {
            try {
                dispatch({ type: 'AUTH_START' });
                const user = await authService.initializeAuth();
                
                if (user) {
                    dispatch({ type: 'AUTH_SUCCESS', payload: user });
                } else {
                    // No stored token or invalid token
                    dispatch({ type: 'AUTH_ERROR', payload: 'No valid session found' });
                }
            } catch (error) {
                dispatch({ type: 'AUTH_ERROR', payload: 'Session expired' });
                tokenStorage.remove(); // Clean up invalid token
            }
        };

        initializeAuth();
    }, []);  

    // Use useCallback to prevent function recreation on every render
    const login = useCallback(async (email: string, password: string) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const data = await authService.login({ email, password });
            tokenStorage.set(data.access_token);
            dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Network error';
            dispatch({ type: 'AUTH_ERROR', payload: message });
        }
    }, []);

    const register = useCallback(async (username: string, email: string, password: string) => {
        try {
            dispatch({ type: 'AUTH_START' });
            const data = await authService.register({ username, email, password });
            tokenStorage.set(data.access_token);
            dispatch({ type: 'AUTH_SUCCESS', payload: data.user });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Network error';
            dispatch({ type: 'AUTH_ERROR', payload: message });
        }
    }, []);

    const logout = useCallback(() => {
        authService.logout();
        dispatch({ type: 'AUTH_LOGOUT' });
    }, []);

    const clearError = useCallback(() => {
        dispatch({ type: 'CLEAR_ERROR' });
    }, []);


    const contextValue = React.useMemo(() => ({
        ...state,
        login,
        register,
        logout,
        clearError,
    }), [state, login, register, logout, clearError]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext };
