import { TOKEN_KEY } from '../config';

/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Store the authentication token in localStorage
 * @param token The JWT token to store
 */
export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

/**
 * Remove the authentication token from localStorage
 */
export const clearToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

/**
 * Check if a user is currently logged in
 * @returns boolean indicating if a token exists
 */
export const isLoggedIn = (): boolean => {
  return getToken() !== null;
};
