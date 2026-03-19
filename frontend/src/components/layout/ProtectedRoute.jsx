import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Spinner from '../ui/Spinner';

/**
 * ProtectedRoute - wraps routes that require authentication
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - The route content to render when authenticated
 */
export default function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 'idle' || status === 'error') {
      // Not authenticated, redirect to login
      navigate('/login');
    }
  }, [status, navigate]);

  if (status === 'loading') {
    return <Spinner />;
  }

  if (status === 'authenticated') {
    return children;
  }

  // While redirecting, render nothing
  return null;
}
