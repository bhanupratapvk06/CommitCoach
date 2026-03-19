import { useContext } from 'react';
import RepoContext from '../contexts/RepoContext.jsx';

/**
 * Custom hook for repository operations and state.
 *
 * @returns {{ repos: Array, watchedRepos: Array<number>, status: string, loadRepos: function, selectRepos: function }}
 */
export default function useRepos() {
  const context = useContext(RepoContext);

  if (!context) {
    throw new Error('useRepos must be used within a RepoProvider');
  }

  const { repos, watchedRepos, status, loadRepos, selectRepos } = context;

  return { repos, watchedRepos, status, loadRepos, selectRepos };
}
