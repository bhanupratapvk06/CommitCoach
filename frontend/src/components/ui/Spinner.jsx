/**
 * Spinner - Loading indicator
 * Renders a simple spinning animation (placeholder; full styling to be added later)
 */
export default function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div
        style={{
          width: '24px',
          height: '24px',
          border: '3px solid #ccc',
          borderTopColor: '#2f81f7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
