import apiClient from './apiClient.js';

/**
 * Fetch the authenticated user's GitHub repositories.
 * @returns {Promise<Array>} List of simplified repo objects
 */
export async function fetchUserRepos() {
  const response = await apiClient.get('/repos');
  return response.data;
}

/**
 * Select the user's watched repositories.
 * @param {number[]} repoIds - Array of GitHub repository IDs
 * @returns {Promise<object>} Response with selected array
 */
export async function selectRepos(repoIds) {
  const response = await apiClient.post('/repos/select', { repoIds });
  return response.data;
}
