import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import useAuth from '../hooks/useAuth';
import useRepos from '../hooks/useRepos';
import RepoCard from '../components/dashboard/RepoCard.jsx';

/**
 * RepoSelectPage — allows user to choose which repositories to watch.
 * Implements USERINTERFACE.md Section 6.3 with search, selection tray, and Free-tier limit modal.
 *
 * Layout: centered container, max-width 1200px.
 */
export default function RepoSelectPage() {
  const { user } = useAuth();
  const { repos, watchedRepos, status, loadRepos, selectRepos } = useRepos();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [limitExceededRepo, setLimitExceededRepo] = useState(null);

  // Fetch repos on mount
  useEffect(() => {
    loadRepos();
  }, [loadRepos]);

  // Determine tier limit; default to Free (2)
  const limit = user?.subscription_tier === 'pro' ? 10 : 2;

  // Filter repos based on search (case-insensitive on full_name)
  const filteredRepos = repos.filter((repo) =>
    repo.full_name.toLowerCase().includes(search.toLowerCase())
  );

  // Handle checkbox toggle: add or remove from selection
  const handleToggle = async (repoId) => {
    const isSelected = watchedRepos.includes(repoId);
    let newSelection;
    if (isSelected) {
      newSelection = watchedRepos.filter((id) => id !== repoId);
    } else {
      if (watchedRepos.length >= limit) {
        // Show modal explaining limit
        setLimitExceededRepo(repoId);
        setModalOpen(true);
        return;
      }
      newSelection = [...watchedRepos, repoId];
    }
    try {
      await selectRepos(newSelection);
    } catch (error) {
      // Error handled by context; just log for debug
      console.error('Selection failed', error);
    }
  };

  // Remove a selected repo from tray
  const handleRemove = async (repoId) => {
    const newSelection = watchedRepos.filter((id) => id !== repoId);
    try {
      await selectRepos(newSelection);
    } catch (error) {
      console.error('Removal failed', error);
    }
  };

  // Radix Dialog modal for Free-tier limit
  const LimitModal = () => (
    <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
          }}
        />
        <Dialog.Content
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            maxWidth: '480px',
            width: '90%',
            boxShadow: 'var(--shadow-lg)',
            zIndex: 1001,
          }}
        >
          <Dialog.Title style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            Free Tier Limit Reached
          </Dialog.Title>
          <Dialog.Description as="p" style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
            You can watch up to {limit} repository{limit > 1 ? 's' : ''} on the Free plan. To watch more, upgrade to Pro.
          </Dialog.Description>
          <button
            onClick={() => navigate('/settings')}
            style={{
              width: '100%',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-brand-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--weight-medium)',
              cursor: 'pointer',
            }}
          >
            Upgrade to Pro
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );

  // Loading state
  if (status === 'loading' && repos.length === 0) {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>Loading repositories...</div>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--color-danger)' }}>
        Failed to load repositories.
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'var(--space-6)',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 'var(--space-8)',
      }}
    >
      <div>
        {/* Search input */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div
            style={{
              position: 'relative',
              maxWidth: '480px',
            }}
          >
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l2.777 2.777a1 1 0 0 0 1.414-1.414l-2.777-2.777a1.007 1.007 0 0 0-.115-.092zM5.5 7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: 'var(--space-3) var(--space-3) var(--space-3) 36px',
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-base)',
              }}
            />
          </div>
        </div>

        {/* Repo list */}
        <div>
          {filteredRepos.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isSelected={watchedRepos.includes(repo.id)}
              onToggle={handleToggle}
            />
          ))}
          {filteredRepos.length === 0 && (
            <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-6)' }}>
              No repositories match your search.
            </div>
          )}
        </div>
      </div>

      {/* Watching tray (sticky on desktop) */}
      <div
        style={{
          position: 'sticky',
          top: 'var(--space-6)',
          alignSelf: 'start',
          backgroundColor: 'var(--color-bg-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-6)',
        }}
      >
        <h3 style={{ fontSize: 'var(--text-lg)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
          Watching
        </h3>
        <div style={{ marginBottom: 'var(--space-4)' }}>
          {watchedRepos.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              No repositories selected yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              {watchedRepos.map((id) => {
                const repo = repos.find((r) => r.id === id);
                if (!repo) return null;
                return (
                  <span
                    key={id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: 'var(--color-bg-elevated)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '4px 8px',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    <span>{repo.full_name}</span>
                    <button
                      onClick={() => handleRemove(id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        fontSize: 'var(--text-base)',
                        lineHeight: 1,
                      }}
                      aria-label={`Remove ${repo.full_name}`}
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
        <div
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: 'var(--space-4)',
          }}
        >
          {watchedRepos.length} / {limit} selected
        </div>
      </div>

      <LimitModal />
    </div>
  );
}
