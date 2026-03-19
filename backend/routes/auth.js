import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/v1/auth/github
 * Redirects user to GitHub OAuth authorization page.
 */
router.get('/github', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;

  if (!clientId || !callbackUrl) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'GitHub OAuth configuration missing' });
  }

  const scope = 'read:user user:email';
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=${encodeURIComponent(scope)}`;

  res.redirect(redirectUri);
});

/**
 * GET /api/v1/auth/callback
 * GitHub OAuth callback — exchanges code for access token, then issues a JWT for the frontend.
 * Query params: code (required), state (optional, ignored in this implementation)
 */
router.get('/callback', async (req, res) => {
  const { code } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const callbackUrl = process.env.GITHUB_CALLBACK_URL;
  const jwtSecret = process.env.JWT_SECRET;

  if (!code || !clientId || !clientSecret || !callbackUrl || !jwtSecret) {
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Server configuration incomplete' });
  }

  try {
    // Exchange code for GitHub access token
    const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackUrl,
    }, {
      headers: { Accept: 'application/json' }
    });

    const { access_token, error: tokenError } = tokenResponse.data;

    if (tokenError || !access_token) {
      return res.status(400).json({ error: 'OAUTH_ERROR', message: 'Failed to obtain access token from GitHub' });
    }

    // Fetch user profile from GitHub
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const githubUser = userResponse.data;

    // Create JWT payload — include essential GitHub profile fields and the GitHub access token
    const payload = {
      githubId: githubUser.id,
      login: githubUser.login,
      name: githubUser.name,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url,
      githubToken: access_token, // for backend GitHub API calls on behalf of the user
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });

    // Redirect to frontend with token in query param (frontend will store in localStorage)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}/login?token=${token}`);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ error: 'GITHUB_API_ERROR', message: 'GitHub API request failed' });
    }
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'OAuth callback failed' });
  }
});

/**
 * GET /api/v1/me
 * Returns the authenticated user's JWT payload.
 * Protected by auth middleware — req.user is set by auth.js.
 */
router.get('/me', auth, (req, res) => {
  res.json(req.user);
});

export default router;
