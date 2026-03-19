import { createContext, useReducer, useEffect } from 'react';

// Initial state shape
// {
//   repos: Array<{id, full_name, language, private, default_branch, pushed_at, html_url, owner:{avatar_url, login}}>,
//   watchedRepos: Array<number>, // array of repo IDs
//   status: 'idle' | 'loading' | 'error'
//   error: string | null
// }

const initialState = {
  repos: [],
  watchedRepos: [],
  status: 'idle',
  error: null,
};

function repoReducer(state, action) {
  switch (action.type) {
    case 'LOAD_REPOS_START':
      return { ...state, status: 'loading', error: null };
    case 'LOAD_REPOS_SUCCESS':
      return { ...state, status: 'idle', repos: action.payload };
    case 'SELECT_REPOS_START':
      return { ...state, status: 'loading', error: null };
    case 'SELECT_REPOS_SUCCESS':
      return { ...state, status: 'idle', watchedRepos: action.payload };
    case 'SELECT_REPOS_ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'SET_ERROR':
      return { ...state, status: 'error', error: action.payload };
    default:
      return state;
  }
}

export const RepoContext = createContext(null);

/**
 * RepoProvider — provides repository list and selection state
 */
export default function RepoProvider({ children }) {
  const [state, dispatch] = useReducer(repoReducer, initialState);

  const value = {
    ...state,
    loadRepos: async () => {
      dispatch({ type: 'LOAD_REPOS_START' });
      try {
        // Import dynamically to avoid circular deps; but githubApi imports apiClient which doesn't import context, safe.
        const { fetchUserRepos } = await import('../lib/githubApi.js');
        const repos = await fetchUserRepos();
        dispatch({ type: 'LOAD_REPOS_SUCCESS', payload: repos });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load repositories' });
      }
    },
    selectRepos: async (repoIds) => {
      dispatch({ type: 'SELECT_REPOS_START' });
      try {
        const { selectRepos } = await import('../lib/githubApi.js');
        const result = await selectRepos(repoIds);
        dispatch({ type: 'SELECT_REPOS_SUCCESS', payload: repoIds });
        return result;
      } catch (error) {
        dispatch({ type: 'SELECT_REPOS_ERROR', payload: error.message || 'Failed to save selection' });
        throw error;
      }
    },
  };

  return <RepoContext.Provider value={value}>{children}</RepoContext.Provider>;
}
