import { Octokit } from 'octokit';

/**
 * Wraps Octokit. All functions accept explicit token parameter for multi-user safety.
 */
export default function githubClient() {
  return {
    /**
     * Fetch authenticated user's repositories (public + private, not forks, sorted by updated desc)
     * @param {string} token - GitHub OAuth access token
     * @returns {Promise<Array>} Array of repo objects with selected fields
     */
    async getUserRepos(token) {
      const octokit = new Octokit({ auth: token });
      const response = await octokit.request('GET /user/repos', {
        visibility: 'all',
        affiliation: 'owner,collaborator,organization_member',
        sort: 'updated',
        per_page: 100,
      });

      // Simplify to necessary fields: id, full_name, language, private, default_branch, pushed_at, html_url, owner.avatar_url
      return response.data.map((repo) => ({
        id: repo.id,
        full_name: repo.full_name,
        language: repo.language,
        private: repo.private,
        default_branch: repo.default_branch,
        pushed_at: repo.pushed_at,
        html_url: repo.html_url,
        owner: {
          avatar_url: repo.owner.avatar_url,
          login: repo.owner.login,
        },
      }));
    },

    /**
     * Check if there is at least one commit on the default branch since the start of today (UTC).
     * @param {string} token - GitHub OAuth access token
     * @param {string} owner - repository owner (user or org)
     * @param {string} repo - repository name
     * @param {string} defaultBranch - repository default branch name
     * @returns {Promise<boolean>} true if a commit exists today, false otherwise
     */
    async hasCommittedToday(token, owner, repo, defaultBranch) {
      const octokit = new Octokit({ auth: token });

      // Build ISO timestamp for start of today in UTC
      const since = new Date();
      since.setUTCHours(0, 0, 0, 0);
      const sinceISO = since.toISOString();

      const response = await octokit.request('GET /repos/{owner}/{repo}/commits', {
        owner,
        repo,
        sha: defaultBranch,
        since: sinceISO,
        per_page: 1,
      });

      return response.data.length > 0;
    },
  };
}
