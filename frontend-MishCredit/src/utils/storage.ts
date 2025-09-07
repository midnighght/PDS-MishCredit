import { API_BASE_URL } from "../../constants";

const TOKEN_KEY = 'auth_token';
/**
 * Token Storage Utility
 * 
 * Object literal that serves as a utility module for managing authentication tokens in browser storage.
 * 
 * What it is:
 * - An exported object that encapsulates token storage operations
 * - A common pattern called a "service object" or "utility object"
 * - Uses JavaScript's localStorage API to persist data across browser sessions
 * 
 * Usage: tokenStorage.methodName()
 * 
 * | Method    | Parameters      | Return Type    | Description                                    |
 * |-----------|----------------|----------------|------------------------------------------------|
 * | get()     | none           | string \| null | Retrieves the token from localStorage         |
 * | set()     | token: string  | void           | Stores a token in localStorage                 |
 * | remove()  | none           | void           | Deletes the token from localStorage           |
 * | exists()  | none           | boolean        | Checks if a token exists                      |
 * 
 * Key differences from a class:
 * 
 * | Object Literal                    | Class                              |
 * |-----------------------------------|------------------------------------|
 * | const obj = { methods }           | class MyClass { methods }          |
 * | Direct usage: tokenStorage.get()  | Instantiation needed: new MyClass()|
 * | Single instance                   | Can create multiple instances      |
 * | No constructor                    | Has constructor                    |
 * | Simpler for utilities             | Better for complex state management|
 * 
 * This pattern is great for utilities that don't need multiple instances or complex state management!
 */
export const tokenStorage = {

    get: (): string | null => {
        return localStorage.getItem(TOKEN_KEY);
    },
    set: (token: string): void => {
        localStorage.setItem(TOKEN_KEY, token);

    },
    remove: (): void => {
        localStorage.removeItem(TOKEN_KEY);

    },
    exists: (): boolean => {
        return !!localStorage.getItem(TOKEN_KEY);

    },

};


 
/**
 * Creates HTTP headers for authenticated requests.
 * 
 * @param token - Optional authentication token. If not provided, retrieves token from storage
 * @returns Object containing Content-Type header and Authorization header (if token is available)
 * 
 * @example
 * ```typescript
 * // With explicit token
 * const headers = createAuthHeaders('your-jwt-token');
 * 
 * // Using stored token
 * const headers = createAuthHeaders();
 * ```
 */
export const createAuthHeaders = (token?: string) => {
    const authToken = token || tokenStorage.get();
    return {
        'Content-Type': 'application/json',
        ...(authToken && {Authorization: `Bearer ${authToken}`}),
    };  
};




 
export const apiEndpoints = {
  login: `${API_BASE_URL}/auth/login`,
  register: `${API_BASE_URL}/auth/register`,
  profile: `${API_BASE_URL}/auth/profile`,
} as const;