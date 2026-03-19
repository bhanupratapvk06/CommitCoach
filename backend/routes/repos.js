import express from 'express';
import { body, validationResult } from 'express-validator';
import Redis from 'ioredis';
import auth from '../middleware/auth.js';
import githubClient from '../services/githubClient.js';

const router = express.Router();

// Redis client (optional — if REDIS_URL not set, operations become no-ops)
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = new Redis(process.env.REDIS_URL);
}

// Helper: get user's watched repo IDs from Redis (or empty array if none)
async function getWatchedRepoIds(userId) {
  if (!redisClient) return [];
  try {
    const data = await redisClient.get(`watched:${userId}`);
    if (!data) return [];
    return JSON.parse(data);
  } catch (err) {
    // In development, Redis may be unavailable; log and return empty
    console.warn('Redis get failed, defaulting to empty selection:', err.message);
    return [];
  }
}

// Helper: set user's watched repo IDs in Redis
async function setWatchedRepoIds(userId, repoIds) {
  if (!redisClient) return;
  try {
    if (repoIds.length === 0) {
      await redisClient.del(`watched:${userId}`);
    } else {
      await redisClient.set(`watched:${userId}`, JSON.stringify(repoIds));
    }
  } catch (err) {
    console.warn('Redis set failed:', err.message);
  }
}

/**
 * GET /api/v1/repos
 * Returns the authenticated user's GitHub repositories, with is_watched flag indicating selection.
 */
router.get('/', auth, async (req, res, next) => {
  try {
    const client = githubClient();
    const token = req.user.githubToken;
    if (!token) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing GitHub token' });
    }
    const repos = await client.getUserRepos(token);

    // Fetch watched selection from Redis and merge
    const userId = req.user.githubId || req.user.id;
    const watchedIds = await getWatchedRepoIds(userId);
    const watchedSet = new Set(watchedIds);

    const enriched = repos.map((repo) => ({
      ...repo,
      is_watched: watchedSet.has(repo.id),
    }));

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/repos/select
 * Body: { repoIds: number[] }
 * Sets the user's watched repository list, enforcing tier limits.
 */
router.post(
  '/select',
  auth,
  [
    body('repoIds')
      .isArray({ min: 0 })
      .withMessage('repoIds must be an array'),
    body('repoIds.*').isInt().withMessage('repoIds must contain integers'),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'VALIDATION_ERROR',
          fields: errors.array().map((e) => ({ field: e.param, message: e.msg })),
        });
      }

      const { repoIds } = req.body;
      const limit = req.user.subscription_tier === 'pro' ? 10 : 2;

      if (repoIds.length > limit) {
        return res.status(403).json({
          error: 'LIMIT_EXCEEDED',
          message: `Your tier allows up to ${limit} watched repos`,
          limit,
        });
      }

      const userId = req.user.githubId || req.user.id;
      await setWatchedRepoIds(userId, repoIds);

      // Return the current selection as an array for confirmation
      res.json({ selected: repoIds });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
