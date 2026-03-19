import useAuth from '../hooks/useAuth';

/**
 * LoginPage — GitHub OAuth entry point
 *
 * Layout: centered, single-column, no sidebar.
 * Background: --color-bg-base with subtle 32px grid pattern overlay.
 *
 * Visual spec: USERINTERFACE.md Section 6.1
 */
export default function LoginPage() {
  const { login, status } = useAuth();

  const handleLogin = () => {
    if (status !== 'loading') {
      login();
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-base)',
        backgroundImage: `
          linear-gradient(
            to right,
            var(--color-border-subtle) 1px,
            transparent 1px
          ),
          linear-gradient(
            to bottom,
            var(--color-border-subtle) 1px,
            transparent 1px
          )
        `,
        backgroundSize: '32px 32px',
        backgroundPosition: '-1px -1px',
        color: 'var(--color-text-primary)',
        fontFamily: 'Inter, sans-serif',
        padding: '20px',
      }}
    >
      {/* Logo */}
      <svg
        width="180"
        height="32"
        viewBox="0 0 180 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '24px' }}
      >
        <text
          x="0"
          y="24"
          fontFamily="Syne, sans-serif"
          fontSize="24"
          fontWeight="800"
          fill="var(--color-text-primary)"
        >
          Commit Coach
        </text>
      </svg>

      {/* Headline */}
      <h1
        style={{
          fontSize: 'var(--text-3xl)',
          fontFamily: 'Syne, sans-serif',
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: '16px',
          lineHeight: 'var(--leading-tight)',
        }}
      >
        Never break your streak.
      </h1>

      {/* Sub-headline */}
      <p
        style={{
          fontSize: 'var(--text-md)',
          color: 'var(--color-text-secondary)',
          textAlign: 'center',
          marginBottom: '32px',
          maxWidth: '480px',
        }}
      >
        Get daily AI-powered code suggestions that keep your GitHub contribution graph green.
      </p>

      {/* GitHub OAuth Button */}
      <button
        onClick={handleLogin}
        disabled={status === 'loading'}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '480px',
          width: '100%',
          justifyContent: 'center',
          padding: '12px 24px',
          backgroundColor: '#24292f',
          color: '#ffffff',
          border: '1px solid var(--color-border-default)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-base)',
          fontWeight: '500',
          cursor: status === 'loading' ? 'not-allowed' : 'pointer',
          transition: 'background-color 150ms ease',
          opacity: status === 'loading' ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (status !== 'loading') e.currentTarget.style.backgroundColor = '#2d3339';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#24292f';
        }}
      >
        {/* GitHub octicon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 16 16"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
        </svg>
        <span>Continue with GitHub</span>
      </button>

      {/* Social Proof Stats */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          marginTop: '48px',
          fontFamily: 'JetBrains Mono, monospace',
          color: 'var(--color-streak-accent)',
          fontSize: 'var(--text-sm)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>2,450</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Users</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>18,920</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Streaks Maintained</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'var(--text-lg)', fontWeight: '600' }}>54,301</div>
          <div style={{ color: 'var(--color-text-secondary)' }}>Commits Assisted</div>
        </div>
      </div>
    </div>
  );
}
