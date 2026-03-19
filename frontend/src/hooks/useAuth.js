import { useContext } from 'react';
import AuthContext from '../contexts/AuthContext';

/**
 * Custom hook for authentication actions and state
 *
 * @returns {{ user: object | null, status: string, login: function, logout: function }}
 */
export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, status, login, logout } = context;

  /**
   * Initiates GitHub OAuth flow — redirects to backend /api/v1/auth/github
   */
  async function initiateLogin() {
    window.location.href = '/api/v1/auth/github';
  }

  /**
   * Logs the user out — clears token from localStorage and redirects to /login
   */
  async function performLogout() {
    localStorage.removeItem('commit-coach-token');
    if (logout) {
      logout(); // Dispatch logout action to reset context state
    }
    window.location.href = '/login';
  }

  return {
    user,
    status,
    login: initiateLogin,
    logout: performLogout,
  };
}
