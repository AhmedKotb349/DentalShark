const express = require('express');
const router = express.Router();
const db = require('../jsonDb');
const jwt = require('jsonwebtoken');

function parseUserSoft(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key');
    } catch { req.user = null; }
  } else { req.user = null; }
  next();
}

function staffOrAdminRequired(req, res, next) {
  const role = ((req.user && req.user.role) || '').toLowerCase();
  if (['admin', 'ceo', 'staff', 'engineer'].includes(role)) return next();
  res.status(403).json({ error: 'Permission denied. Engineer/Admin/Staff privilege required.' });
}

// GET /api/service-bookings — Engineer/Admin/Staff see all; everyone else sees only their own
router.get('/', parseUserSoft, (req, res) => {
  const role = ((req.user && req.user.role) || '').toLowerCase();
  const isElevated = ['admin', 'ceo', 'staff', 'engineer'].includes(role);
  const all = db.bookings.find({});
  const bookings = isElevated
    ? all
    : all.filter(b => req.user && (b.userId === req.user.id || b.userId === req.user._id || b.userUid === req.user.uid));
  res.json(bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// POST /api/service-bookings — create (any signed-in user, including guests)
router.post('/', parseUserSoft, (req, res) => {
  const booking = db.bookings.insert({
    ...req.body,
    userId: req.user ? (req.user.id || req.user._id) : null,
    userUid: req.user ? req.user.uid : null,
    userName: req.user ? req.user.name : (req.body.name || 'Guest'),
  });
  res.json({ success: true, booking });
});

// PUT /api/service-bookings/:id — update status (Engineer/Admin/Staff only)
router.put('/:id', parseUserSoft, staffOrAdminRequired, (req, res) => {
  const booking = db.bookings.update(req.params.id, req.body);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true, booking });
});

// DELETE /api/service-bookings/:id — remove (Engineer/Admin/Staff only)
router.delete('/:id', parseUserSoft, staffOrAdminRequired, (req, res) => {
  const deleted = db.bookings.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Booking not found' });
  res.json({ success: true });
});

module.exports = router;
