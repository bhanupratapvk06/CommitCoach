import { createContext, useReducer, useEffect } from 'react';

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

  // On mount, check localStorage for existing token and restore session
  useEffect(() => {
    const storedToken = localStorage.getItem('commit-coach-token');
    if (storedToken) {
      // Token exists; we need to fetch user profile to reconstruct full state.
      // This is a simplified version — in a full implementation we'd decode the JWT
      // or call a /me endpoint. For now we'll set token and leave user null;
      // consuming components can handle the hydration flow.
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user: null, token: storedToken } });
    } else {
      dispatch({ type: 'LOGIN_START' }); // Move from 'idle' to a known state; actual auth not present
    }
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
