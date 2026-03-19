import { createContext, useReducer, useEffect } from 'react';
import apiClient from '../lib/apiClient.js';

// Initial state shape
// {
//   user: { githubId, login, name, email, avatar_url } | null,
//   token: string | null,
//   status: 'idle' | 'loading' | 'authenticated' | 'error'
// }

const initialState = {
  user: null,
  token: null,
  status: 'idle',
};

/**
 * Reducer for authentication state transitions
 */
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, status: 'loading', error: null };
    case 'LOGIN_SUCCESS':
      return { user: action.payload.user, token: action.payload.token, status: 'authenticated', error: null };
    case 'LOGOUT':
      return { user: null, token: null, status: 'idle', error: null };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}

/**
 * AuthContext — global authentication state for the app
 */
export const AuthContext = createContext(null);

/**
 * AuthProvider component — wraps the application and provides auth state + dispatch
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Child components to be wrapped
 */
export default function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // On mount, extract token from OAuth callback URL if present, then hydrate user from /me
  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      // Step A: Check for token in URL (fresh OAuth callback)
      const params = new URLSearchParams(window.location.search);
      const tokenFromUrl = params.get('token');
      if (tokenFromUrl) {
        localStorage.setItem('commit-coach-token', tokenFromUrl);
        // Clean the URL to remove token without causing a navigation
        window.history.replaceState({}, '', window.location.pathname);
      }

      // Step B: Check localStorage for token (may have just been saved or from prior session)
      const storedToken = localStorage.getItem('commit-coach-token');

      if (!storedToken) {
        if (isMounted) dispatch({ type: 'LOGOUT' });
        return;
      }

      // We have a token; show loading while we verify it
      if (isMounted) dispatch({ type: 'LOGIN_START' });

      // Step C: Call /api/v1/me to get user profile
      try {
        const response = await apiClient.get('/api/v1/auth/me');
        const user = response.data;

        if (isMounted) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token: storedToken } });
        }
      } catch (error) {
        // 401 or network error → clear token and logout
        localStorage.removeItem('commit-coach-token');
        if (isMounted) {
          dispatch({ type: 'LOGOUT' });
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  // Persist token to localStorage whenever it changes
  useEffect(() => {
    if (state.token) {
      localStorage.setItem('commit-coach-token', state.token);
    } else {
      localStorage.removeItem('commit-coach-token');
    }
  }, [state.token]);

  const value = {
    ...state,
    login: (user, token) => dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } }),
    logout: () => dispatch({ type: 'LOGOUT' }),
    setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
