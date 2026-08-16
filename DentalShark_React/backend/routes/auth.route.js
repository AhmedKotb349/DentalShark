const express = require('express');
const jwt = require('jsonwebtoken');
const Database = require('../patterns/Database');
const { UserFactory } = require('../patterns/UserFactory');
const { buildAuthValidationChain } = require('../patterns/ValidationChain');
const db = Database.getInstance(); // SINGLETON: shared data-access instance
const router = express.Router();

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user._id, uid: user.uid, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key',
    { expiresIn: '24h' }
  );
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, guest, selectedRole } = req.body;

    // Guest login — creates a brand-new, uniquely-identified user record each time.
    // Guests are real user rows in the database (no shared account, no password),
    // so their cart/wishlist/orders are genuinely isolated per visit like any other user.
    if (guest) {
      const shortId = Math.random().toString(36).slice(2, 7).toUpperCase();
      const guestUser = await db.users.insert({
        uid: `guest_${shortId.toLowerCase()}`,
        name: `Guest #${shortId}`,
        email: `guest_${shortId.toLowerCase()}@dentalshark.eg`,
        role: 'Guest',
        dept: 'Visitor',
        phone: '\u2014',
        initials: 'G' + shortId[0],
        color: '#64748b',
        orders: 0,
        spent: '\u2014',
        joined: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        sharkPts: 0,
      });
      const token = generateToken(guestUser);
      return res.json({ success: true, token, user: db.users.toProfile(guestUser) });
    }

    // CHAIN OF RESPONSIBILITY: empty-fields -> email-format -> role-suitability handlers
    const loginChain = buildAuthValidationChain();
    const loginCheck = loginChain.handle({ mode: 'login', email, password, role: selectedRole });
    if (!loginCheck.valid) {
      return res.status(400).json({ error: loginCheck.error });
    }

    // Find user by email
    const user = db.users.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'No account found with this email' });
    }

    // Verify role matches selected role (case-insensitive) — a business/DB-state rule,
    // separate from the generic input-format checks the chain already ran above.
    if (selectedRole) {
      const selectedRoleLower = selectedRole.toLowerCase();
      const roleMapping = {
        'dentist': ['doctor', 'dentist'],
        'vendor': ['vendor'],
        'student': ['student'],
        'admin': ['admin', 'ceo'],
        'staff': ['staff'],
        'engineer': ['engineer']
      };
      const allowedRoles = roleMapping[selectedRoleLower] || [];
      const userRoleLower = (user.role || '').toLowerCase();
      if (!allowedRoles.includes(userRoleLower)) {
        return res.status(401).json({ error: `This account is registered as "${user.role}", not "${selectedRole}". Please choose the correct tab or sign in without selecting a role.` });
      }
    }

    // Verify password
    const isMatch = await db.users.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Generate token
    const token = generateToken(user);
    res.json({ success: true, token, user: db.users.toProfile(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during authentication' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // CHAIN OF RESPONSIBILITY: empty-fields -> email-format -> role-suitability -> password-strength
    const registerChain = buildAuthValidationChain();
    const check = registerChain.handle({ mode: 'register', name, email, password, role });
    if (!check.valid) {
      return res.status(400).json({ error: check.error });
    }

    // Check if email already exists
    const existing = db.users.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // FACTORY METHOD: build the right AppUser subclass for this role
    const newUser = UserFactory.createUser(role, { name, email, password, phone });
    const user = await db.users.insert(newUser.toObject());
    const token = generateToken(user);
    res.status(201).json({ success: true, token, user: db.users.toProfile(user) });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// GET /api/auth/me (protected)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key');
    let user = db.users.findById(decoded.id);
    if (!user && decoded.email) {
      user = db.users.findOne({ email: decoded.email.toLowerCase().trim() });
    }
    if (!user && decoded.uid) {
      user = db.users.findOne({ uid: decoded.uid });
    }

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: db.users.toProfile(user) });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

module.exports = router;
