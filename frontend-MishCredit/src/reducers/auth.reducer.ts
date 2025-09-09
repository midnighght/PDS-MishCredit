import type { AuthAction, AuthState, UserData } from "../types/auth.types";

/**
 * 
 * Initial state for authentication
 * 
 * 
 * 
 */
export const initialAuthState: AuthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,

};
/**
 * Auth reducer to manage authentication state
 * Handles login flow, user data managment, and error states
 * @param state - Current auth state
 * @param action - Action to perform 
 * @returns New auth state
 * 
 */

export function authReducer(state: AuthState, action: AuthAction): AuthState {
    switch (action.type) {
        case "LOGIN_START":
            return {
                ...state,
                loading: true,
                error: null
            };
        case "LOGIN_SUCCESS":
            //Construct user data from login response
            const userData: UserData = {
                rut: action.payload.rut,
                email: action.payload.email, // this should be passed from login form
                carreras: action.payload.carreras
            };
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: userData,
                error: null
            };
        case "LOGIN_ERROR":
            return{
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload || 'Login failed'
            };
        case "LOGOUT":
            return {
                ...initialAuthState
            };
        case "CLEAR_ERROR":
            return{
                ...state,
                error: null,
            };
        default:
            return state;
    }
}