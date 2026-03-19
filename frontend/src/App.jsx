import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ProtectedRoute from './components/layout/ProtectedRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';

/**
 * App — route definitions per ARCHITECTURE.md Section 5.1
 * Pages are composition only; protected routes wrapped in ProtectedRoute.
 * Each page is wrapped in ErrorBoundary for production stability.
 */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <ErrorBoundary fallback={<div>Login page failed to load</div>}>
            <LoginPage />
          </ErrorBoundary>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <ErrorBoundary fallback={<div>Dashboard failed to load</div>}>
              <DashboardPage />
            </ErrorBoundary>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Catch-all 404 */}
      <Route
        path="*"
        element={
          <ErrorBoundary fallback={<div>Page not found</div>}>
            <div style={{ padding: 'var(--space-6)' }}>
              <h1 style={{ fontSize: 'var(--text-2xl)' }}>404 — Not Found</h1>
            </div>
          </ErrorBoundary>
        }
      />
    </Routes>
  );
}
