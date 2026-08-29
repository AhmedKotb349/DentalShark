const express = require('express');
const router = express.Router();
const db = require('../jsonDb');
const { parseUser } = require('../middleware/auth');

// GET all suppliers
router.get('/', (req, res) => {
  const suppliers = db.suppliers.find();
  res.json(suppliers);
});

// GET single supplier
router.get('/:id', (req, res) => {
  const s = db.suppliers.findById(req.params.id);
  if (!s) return res.status(404).json({ error: 'Supplier not found' });
  res.json(s);
});

// POST create supplier (admin only)
router.post('/', parseUser, (req, res) => {
  const caller = req.user;
  if (!caller || !['admin', 'ceo', 'staff'].includes((caller.role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { name, contact, products } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const supplier = db.suppliers.insert({ name, contact: contact || '', products: products || '' });
  res.status(201).json({ success: true, supplier });
});

// PUT update supplier (admin only)
router.put('/:id', parseUser, (req, res) => {
  const caller = req.user;
  if (!caller || !['admin', 'ceo', 'staff'].includes((caller.role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const supplier = db.suppliers.update(req.params.id, req.body);
  if (!supplier) return res.status(404).json({ error: 'Supplier not found' });
  res.json({ success: true, supplier });
});

// DELETE supplier (admin only)
router.delete('/:id', parseUser, (req, res) => {
  const caller = req.user;
  if (!caller || !['admin', 'ceo', 'staff'].includes((caller.role || '').toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const deleted = db.suppliers.delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Supplier not found' });
  res.json({ success: true });
});

module.exports = router;
