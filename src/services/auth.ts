import { API_BASE_URL } from "../config";
import { getToken, setToken, clearToken } from "../utils/token";

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || "Login failed. Please check your credentials."
        );
      }

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Clear authentication token
   */
  logout() {
    clearToken();
  },

  /**
   * Validate the current authentication token
   */
  async validateToken() {
    const token = getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/validate-token`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        clearToken();
        window.location.href = "/login";
      }
      return response.ok;
    } catch (error) {
      console.error("Token validation failed:", error);
      return false;
    }
  },
};

export default authService;
