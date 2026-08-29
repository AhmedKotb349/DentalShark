const express = require('express');
const router = express.Router();
const db = require('../jsonDb');
const jwt = require('jsonwebtoken');

// Auth middleware (supports authenticated or guest user)
function parseUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key');
    }
  } catch (err) {
    // Ignore invalid token, treat as anonymous/guest
  }
  next();
}

// Resilient user resolver to prevent stale session errors
function getResilientUser(req) {
  let user;
  if (req.user) {
    if (req.user.id) {
      user = db.users.findById(req.user.id);
    }
    if (!user && req.user.email) {
      user = db.users.findOne({ email: req.user.email.toLowerCase().trim() });
    }
    if (!user && req.user.uid) {
      user = db.users.findOne({ uid: req.user.uid });
    }
  }
  if (!user) {
    user = db.users.findOne({ uid: 'guest' }) || {
      _id: "guest",
      uid: "guest",
      name: "Guest User",
      role: "Guest",
      color: "#64748b",
      initials: "GU"
    };
  }
  return user;
}

// POST /api/social/react — Toggle a reaction (likes, hearts, claps, science)
router.post('/react', parseUser, (req, res) => {
  try {
    const { productId, type } = req.body; // type: likes, hearts, claps, science
    if (!productId || !type) {
      return res.status(400).json({ error: 'ProductId and reaction type are required' });
    }

    const user = getResilientUser(req);
    const products = db.products.find();
    // Support matching by either pid or id
    const product = products.find(p => p.pid === Number(productId) || p.id === Number(productId));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Initialize reactors if absent
    if (!product.reactors) product.reactors = [];
    if (!product.reactions) product.reactions = { likes: 0, hearts: 0, claps: 0, science: 0 };

    const userId = user._id || user.uid;
    const existingReactorIdx = product.reactors.findIndex(r => r.userId === userId);

    if (existingReactorIdx !== -1) {
      const existingReactor = product.reactors[existingReactorIdx];
      if (existingReactor.type === type) {
        // Toggle action: if same type, remove it
        product.reactors.splice(existingReactorIdx, 1);
      } else {
        // Change type: if different type, update type
        existingReactor.type = type;
      }
    } else {
      // Add first reaction
      product.reactors.push({
        userId: userId,
        userName: user.name,
        userColor: user.color || '#64748b',
        userInitials: user.initials || 'GU',
        type: type
      });
    }

    // Calculate sum of reactions
    product.reactions = { likes: 0, hearts: 0, claps: 0, science: 0 };
    product.reactors.forEach(r => {
      if (product.reactions[r.type] !== undefined) {
        product.reactions[r.type]++;
      }
    });

    db.products.insertMany(products);
    res.json({ success: true, reactions: product.reactions, reactors: product.reactors });
  } catch (err) {
    console.error('Error reacting to product:', err);
    res.status(500).json({ error: 'Failed to apply reaction' });
  }
});

// POST /api/social/comments — Post a comment on a product
router.post('/comment', parseUser, (req, res) => {
  try {
    const { productId, text } = req.body;
    if (!productId || !text || !text.trim()) {
      return res.status(400).json({ error: 'ProductId and comment text are required' });
    }

    const user = getResilientUser(req);
    const products = db.products.find();
    const product = products.find(p => p.pid === Number(productId) || p.id === Number(productId));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.comments) product.comments = [];

    const now = new Date();
    const timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    const newComment = {
      id: Date.now(),
      userId: user._id || user.uid,
      userName: user.name,
      userRole: user.role || 'Guest',
      userColor: user.color || '#64748b',
      userInitials: user.initials || 'GU',
      text: text.trim(),
      timestamp
    };

    product.comments.push(newComment);
    db.products.insertMany(products);

    res.status(201).json({ success: true, comment: newComment, comments: product.comments });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// DELETE /api/social/comment/:productId/:commentId — Delete a comment
router.delete('/comment/:productId/:commentId', parseUser, (req, res) => {
  try {
    const { productId, commentId } = req.params;
    
    const user = getResilientUser(req);
    const products = db.products.find();
    const product = products.find(p => p.pid === Number(productId) || p.id === Number(productId));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (!product.comments) product.comments = [];

    const commentIdx = product.comments.findIndex(c => String(c.id) === String(commentId));
    if (commentIdx === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const comment = product.comments[commentIdx];
    const isOwner = String(comment.userId) === String(user._id || user.uid);
    const isAdminOrStaff = ['Admin', 'Staff', 'CEO'].includes(user.role);

    if (!isOwner && !isAdminOrStaff) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    product.comments.splice(commentIdx, 1);
    db.products.insertMany(products);

    res.json({ success: true, comments: product.comments });
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;
