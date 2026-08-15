const jwt = require('jsonwebtoken');
const db = require('../jsonDb');

const JWT_SECRET = process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key';

/**
 * parseUser — attaches req.user from Bearer token.
 * Does NOT reject unauthenticated requests; those are
 * handled by callers that need auth (requireAuth).
 */
function parseUser(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) { req.user = null; return next(); }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload.id || payload.userId || payload._id;

    // Guests are real database rows now (unique uid like "guest_a1b2c"),
    // so look them up the same way as any other user.
    let user = db.users.findById(userId);
    if (!user && payload.uid) user = db.users.findOne({ uid: payload.uid });
    req.user = user || null;
  } catch {
    req.user = null;
  }
  next();
}

/**
 * requireAuth — rejects requests without a valid user.
 * Chain after parseUser.
 */
function requireAuth(req, res, next) {
  if (!req.user || (req.user.uid || '').startsWith('guest')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
}

module.exports = { parseUser, requireAuth, JWT_SECRET };
