const express = require('express');
const router = express.Router();
const db = require('../jsonDb');
const jwt = require('jsonwebtoken');

// Staff / Admin check middleware — mirrors orders.route.js so product
// mutations use the same Admin/Staff/CEO gate as order management.
function staffOrAdminRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key');
    req.user = decoded;

    const role = (decoded.role || '').toLowerCase();
    if (['admin', 'ceo', 'staff'].includes(role)) {
      next();
    } else {
      res.status(403).json({ error: 'Permission denied. Admin or Staff privilege required.' });
    }
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// POST /api/products — create (Admin/Staff only)
router.post('/', staffOrAdminRequired, (req, res) => {
  const { name, brand, cat, cat2, price, old: oldPrice, img, desc, rating, rev, pts, badge, warranty, stock } = req.body;
  if (!name || !brand || !price) {
    return res.status(400).json({ error: 'name, brand and price are required' });
  }
  const product = db.products.insert({
    name, brand,
    cat: cat || (cat2 || '').toUpperCase(),
    cat2: cat2 || cat || 'Restorative',
    price: Number(price),
    old: oldPrice ? Number(oldPrice) : Number(price),
    img: img || '',
    desc: desc || '',
    rating: rating ? Number(rating) : 4.5,
    rev: rev ? Number(rev) : 0,
    pts: pts ? Number(pts) : Math.round(Number(price) * 0.1),
    badge: badge || '',
    warranty: warranty || '',
    stock: stock || '',
  });
  res.status(201).json({ success: true, product });
});

// PUT /api/products/:id — update (Admin/Staff only)
router.put('/:id', staffOrAdminRequired, (req, res) => {
  const updates = { ...req.body };
  ['price', 'old', 'rating', 'rev', 'pts'].forEach(k => {
    if (updates[k] !== undefined) updates[k] = Number(updates[k]);
  });
  const product = db.products.update(req.params.id, updates);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true, product });
});

// DELETE /api/products/:id — remove (Admin/Staff only)
router.delete('/:id', staffOrAdminRequired, (req, res) => {
  const deleted = db.products.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Product not found' });
  res.json({ success: true });
});

module.exports = router;
