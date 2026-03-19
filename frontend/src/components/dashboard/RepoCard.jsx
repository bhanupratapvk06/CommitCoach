/**
 * RepoCard — displays repository information with a checkbox for selection.
 *
 * @param {object} props
 * @param {object} props.repo - Repository object with fields: id, full_name, language, private, pushed_at, owner.{avatar_url,login}
 * @param {boolean} props.isSelected - Whether this repo is currently selected
 * @param {function} props.onToggle - Called with repo.id when checkbox is toggled
 */
export default function RepoCard({ repo, isSelected, onToggle }) {
  const { id, full_name, language, private: isPrivate, pushed_at, owner } = repo;

  // Format date to a simple readable string
  const lastCommitDate = pushed_at ? new Date(pushed_at).toLocaleDateString() : 'Never';

  // Determine language color (limited set for demo)
  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#2b7489',
    Python: '#3572A5',
    Java: '#b07219',
    'C#': '#178600',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
  };
  const color = language && languageColors[language] ? languageColors[language] : '#8b949e';

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
    padding: 'var(--space-4)',
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-3)',
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
  };

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    marginRight: 'var(--space-3)',
    cursor: 'pointer',
  };

  const infoStyle = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const nameStyle = {
    fontSize: 'var(--text-base)',
    fontWeight: 'var(--weight-medium)',
    color: 'var(--color-text-primary)',
  };

  const metaStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    fontSize: 'var(--text-sm)',
    color: 'var(--color-text-secondary)',
  };

  const langDotStyle = {
    width: '10px',
    height: '10px',
    borderRadius: 'var(--radius-full)',
    backgroundColor: color,
    display: 'inline-block',
  };

  const badgeStyle = {
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--weight-semibold)',
    backgroundColor: 'var(--color-bg-elevated)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border-subtle)',
  };

  return (
    <div
      style={containerStyle}
      onClick={() => onToggle(id)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--color-bg-surface)';
      }}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle(id);
        }
      }}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggle(id)}
        style={checkboxStyle}
        onClick={(e) => e.stopPropagation()} // prevent double toggle
      />
      <div style={infoStyle}>
        <div style={nameStyle}>{full_name}</div>
        <div style={metaStyle}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={langDotStyle}></span>
            {language || 'Unknown'}
          </span>
          <span>•</span>
          <span>{lastCommitDate}</span>
          <span>•</span>
          <span style={badgeStyle}>{isPrivate ? 'Private' : 'Public'}</span>
        </div>
      </div>
    </div>
  );
}
