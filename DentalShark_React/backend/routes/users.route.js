const express = require('express');
const router = express.Router();
const db = require('../jsonDb');
const { parseUser } = require('../middleware/auth');

// GET all users (public – for team display)
router.get('/', (req, res) => {
  const users = db.users.find();
  res.json(users.map(db.users.toProfile));
});

// GET single user
router.get('/:id', parseUser, (req, res) => {
  const u = db.users.findById(req.params.id);
  if (!u) return res.status(404).json({ error: 'User not found' });
  res.json(db.users.toProfile(u));
});

// POST create user (admin only)
router.post('/', parseUser, async (req, res) => {
  const caller = req.user;
  if (!caller || !['admin', 'ceo', 'staff'].includes((caller.role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { name, email, password, phone, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email and password are required' });
  }
  const existing = db.users.findOne({ email });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  try {
    const user = await db.users.insert({ name, email, password, phone: phone || '', role: role || 'Dentist' });
    res.status(201).json({ success: true, user: db.users.toProfile(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update user (self or admin)
router.put('/:id', parseUser, async (req, res) => {
  const caller = req.user;
  const isAdmin = caller && ['admin', 'ceo', 'staff'].includes((caller.role || '').toLowerCase());
  const isSelf = caller && (caller._id === req.params.id || caller.uid === req.params.id);

  if (!isAdmin && !isSelf) return res.status(403).json({ error: 'Forbidden' });

  const allowed = ['name', 'phone', 'dept'];
  if (isAdmin) allowed.push('role', 'active');

  const updates = {};
  allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

  const user = db.users.update(req.params.id, updates);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, user: db.users.toProfile(user) });
});

// DELETE user (admin only)
router.delete('/:id', parseUser, (req, res) => {
  const caller = req.user;
  const isAdmin = caller && ['admin', 'ceo', 'staff'].includes((caller.role || '').toLowerCase());
  if (!isAdmin) return res.status(403).json({ error: 'Forbidden' });

  const deleted = db.users.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true });
});

module.exports = router;
