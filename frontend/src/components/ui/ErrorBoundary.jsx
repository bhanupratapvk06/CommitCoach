import React from 'react';

/**
 * ErrorBoundary — catches JavaScript errors in child components
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Components to wrap
 * @param {React.ReactNode} props.fallback - UI to show when an error occurs
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // In a real app, log to an error reporting service here
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div
          style={{
            padding: 'var(--space-6)',
            textAlign: 'center',
            color: 'var(--color-text-primary)',
          }}
        >
          <h2 style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
