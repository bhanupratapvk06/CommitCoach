import jwt from 'jsonwebtoken';

/**
 * JWT authentication middleware
 * Verifies the Authorization header, attaches decoded payload to req.user.
 * Returns 401 if token is missing or invalid.
 * No database lookups — trusts the signed payload.
 *
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next function
 */
export default function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or malformed Authorization header' });
  }

  const token = authHeader.slice(7); // Remove 'Bearer ' prefix
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    const err = new Error('JWT_SECRET is not configured');
    return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Server configuration error' });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
}
