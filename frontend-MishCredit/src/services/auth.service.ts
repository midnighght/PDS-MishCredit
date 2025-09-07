import type {
    LoginCredentials,
    RegisterCredentials,
    AuthResponse,
    User,
} from '../types/auth.types'

import { tokenStorage, createAuthHeaders, apiEndpoints } from '../utils/storage';




class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const response = await fetch(apiEndpoints.login, {
            method: 'POST',
            headers: createAuthHeaders(),
            body: JSON.stringify(credentials),

        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }
        return response.json();
    }
    async register(credentials: RegisterCredentials): Promise<AuthResponse> {
        const response = await fetch(apiEndpoints.register, {
            method: 'POST',
            headers: createAuthHeaders(),
            body: JSON.stringify(credentials),

        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Registration failed');
        }
        return response.json();
    }

    async getCurrentUser(): Promise<User> {
        const token = tokenStorage.get();
        if (!token) {
            throw new Error('No authentication token found');
            // send to register ??
        }
        const response = await fetch(apiEndpoints.profile, {
            headers: createAuthHeaders(token),
        });
        if (!response.ok) {
            tokenStorage.remove();
            throw new Error('Session expired');
            // send to login ?
        }
        return response.json();

    }
    async initializeAuth(): Promise<User | null> {
        if (!tokenStorage.exists()) {
            return null;  
        }

        try {
            return await this.getCurrentUser();
        } catch (error) {
            tokenStorage.remove();
            return null;  
        }
    }

    async logout(): Promise<void> {
        try {

            tokenStorage.remove();

            // Optional: Invalidate on server (async)
        } catch (error) {
            console.error('Logout error:', error);
            // Token still removed locally even if server call fails
        }
    }
}
export const authService = new AuthService();
