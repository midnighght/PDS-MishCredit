import type { AuthState, AuthAction } from '../types/auth.types';



/**
 * Initial state for authentication reducer.
 * 
 * @description Defines the default state values for the authentication system
 * when the application starts or when authentication state is reset.
 * 
 * @property {null} user - Initially no user is logged in
 * @property {false} isAuthenticated - User starts as not authenticated
 * @property {false} isLoading - No authentication operations are in progress initially
 * @property {null} error - No authentication errors present at startup
 */
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

 

 
/**
 * Authentication reducer function that handles state transitions for authentication-related actions.
 * 
 * @param state - The current authentication state
 * @param action - The action object containing type and optional payload
 * @returns The new authentication state after applying the action
 * 
 * @remarks
 * This reducer handles the following action types:
 * - `AUTH_START`: Sets loading to true and clears errors
 * - `AUTH_SUCCESS`: Sets user data, marks as authenticated, stops loading, and clears errors
 * - `AUTH_ERROR`: Clears user data, marks as not authenticated, stops loading, and sets error
 * - `AUTH_LOGOUT`: Clears user data, marks as not authenticated, stops loading, and clears errors
 * - `CLEAR_ERROR`: Clears any existing error while preserving other state
 * 
 * @example
 * ```typescript
 * const newState = authReducer(currentState, { type: 'AUTH_START' });
 * ```
 */
export const authReducer = (state: AuthState, action:  AuthAction): AuthState =>{

    switch(action.type){

        case 'AUTH_START': 
            return {
                ...state,
                isLoading:true,
                error: null,

            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            }
        case 'AUTH_ERROR':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload
            };
        case 'AUTH_LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return{
                ...state,
                error: null
            };
        default: 
            return state;
    }

} 








