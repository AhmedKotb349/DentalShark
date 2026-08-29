const express = require('express');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { UserFactory } = require('../patterns/UserFactory');
const { buildAuthValidationChain } = require('../patterns/ValidationChain');

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key';

// Generate JWT token
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      uid: user.uid,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Convert MongoDB user to safe profile
function toProfile(user) {
  if (!user) return null;

  if (typeof user.toProfile === 'function') {
    return user.toProfile();
  }

  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  delete obj.__v;

  return obj;
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password, guest, selectedRole } = req.body;

    // ─────────────────────────────────────────────
    // Guest Login
    // ─────────────────────────────────────────────
    if (guest) {
      const shortId = Math.random()
        .toString(36)
        .slice(2, 7)
        .toUpperCase();

      const guestUser = await User.create({
        uid: `guest_${shortId.toLowerCase()}`,
        name: `Guest #${shortId}`,
        email: `guest_${shortId.toLowerCase()}@dentalshark.eg`,
        role: 'Guest',
        dept: 'Visitor',
        phone: '—',
        initials: `G${shortId[0]}`,
        color: '#64748b',
        orders: 0,
        spent: '—',
        joined: new Date().toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric',
        }),
        sharkPts: 0,
      });

      const token = generateToken(guestUser);

      return res.json({
        success: true,
        token,
        user: toProfile(guestUser),
      });
    }

    // ─────────────────────────────────────────────
    // Validate Login Request
    // ─────────────────────────────────────────────
    const loginChain = buildAuthValidationChain();

    const loginCheck = loginChain.handle({
      mode: 'login',
      email,
      password,
      role: selectedRole,
    });

    if (!loginCheck.valid) {
      return res.status(400).json({
        error: loginCheck.error,
      });
    }

    // ─────────────────────────────────────────────
    // Find User in MongoDB
    // ─────────────────────────────────────────────
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        error: 'No account found with this email',
      });
    }

    // ─────────────────────────────────────────────
    // Validate Selected Role
    // ─────────────────────────────────────────────
    if (selectedRole) {
      const selectedRoleLower = selectedRole.toLowerCase();

      const roleMapping = {
        dentist: ['doctor', 'dentist'],
        vendor: ['vendor'],
        student: ['student'],
        admin: ['admin', 'ceo'],
        staff: ['staff'],
        engineer: ['engineer'],
      };

      const allowedRoles = roleMapping[selectedRoleLower] || [];
      const userRoleLower = (user.role || '').toLowerCase();

      if (!allowedRoles.includes(userRoleLower)) {
        return res.status(401).json({
          error: `This account is registered as "${user.role}", not "${selectedRole}". Please choose the correct tab or sign in without selecting a role.`,
        });
      }
    }

    // ─────────────────────────────────────────────
    // Verify Password
    // ─────────────────────────────────────────────
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        error: 'Incorrect password',
      });
    }

    // ─────────────────────────────────────────────
    // Generate Token
    // ─────────────────────────────────────────────
    const token = generateToken(user);

    return res.json({
      success: true,
      token,
      user: toProfile(user),
    });
  } catch (err) {
    console.error('Login error:', err);

    return res.status(500).json({
      error: 'Server error during authentication',
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
    } = req.body;

    // ─────────────────────────────────────────────
    // Validate Registration
    // ─────────────────────────────────────────────
    const registerChain = buildAuthValidationChain();

    const check = registerChain.handle({
      mode: 'register',
      name,
      email,
      password,
      role,
    });

    if (!check.valid) {
      return res.status(400).json({
        error: check.error,
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ─────────────────────────────────────────────
    // Check Existing User in MongoDB
    // ─────────────────────────────────────────────
    const existing = await User.findOne({
      email: normalizedEmail,
    });

    if (existing) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    // ─────────────────────────────────────────────
    // Create User using existing Factory
    // ─────────────────────────────────────────────
    const newUser = UserFactory.createUser(role, {
      name,
      email: normalizedEmail,
      password,
      phone,
    });

    const userData = newUser.toObject();

    const user = await User.create(userData);

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      token,
      user: toProfile(user),
    });
  } catch (err) {
    console.error('Register error:', err);

    // MongoDB duplicate key
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'An account with this email already exists',
      });
    }

    return res.status(500).json({
      error: 'Server error during registration',
    });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Not authenticated',
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    let user = null;

    // Find by MongoDB _id
    if (decoded.id) {
      user = await User.findById(decoded.id);
    }

    // Fallback by email
    if (!user && decoded.email) {
      user = await User.findOne({
        email: decoded.email.toLowerCase().trim(),
      });
    }

    // Fallback by uid
    if (!user && decoded.uid) {
      user = await User.findOne({
        uid: decoded.uid,
      });
    }

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    return res.json({
      user: toProfile(user),
    });
  } catch (err) {
    console.error('Auth /me error:', err.message);

    return res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
});

module.exports = router;
