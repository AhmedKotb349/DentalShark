const express = require('express');
const router = express.Router();
const Database = require('../patterns/Database');
const CheckoutFacade = require('../patterns/CheckoutFacade');
const OrderPrototype = require('../patterns/OrderPrototype');
const db = Database.getInstance(); // SINGLETON: shared data-access instance
const jwt = require('jsonwebtoken');

// Auth middleware
function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dental_shark_fallback_jwt_secret_token_key');
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Staff / Admin check middleware
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

// POST /api/orders — Create order
router.post('/', auth, async (req, res) => {
  try {
    const { items, subtotal, shipping, total, paymentMethod, address } = req.body;
    if (!items || !items.length) return res.status(400).json({ error: 'Cart is empty' });

    const orderId = '#DS-' + String(Math.floor(Math.random() * 90000) + 10000);
    const trackingId = 'TRK-' + Date.now().toString(36).toUpperCase();
    const ptsEarned = items.reduce((a, b) => a + (b.pts || 0) * (b.qty || 1), 0);

    const d1 = new Date(); d1.setDate(d1.getDate() + 3);
    const d2 = new Date(); d2.setDate(d2.getDate() + 5);
    const fmt = dt => dt.toLocaleDateString('en-EG', { month: 'short', day: 'numeric' });
    const estimatedDelivery = fmt(d1) + ' – ' + fmt(d2) + ', ' + d1.getFullYear();

    const user = db.users.findById(req.user.id);

    const orderObj = {
      orderId,
      userId: req.user.id,
      customerName: user ? user.name : 'Dental Professional',
      items,
      subtotal: subtotal || items.reduce((a, b) => a + b.price * b.qty, 0),
      shipping: shipping || 150,
      total: total || items.reduce((a, b) => a + b.price * b.qty, 0) + 150,
      paymentMethod: paymentMethod || 'COD',
      trackingId,
      ptsEarned,
      estimatedDelivery,
      address: address || '',
      status: 'Pending',
    };
    
    const order = db.orders.insert(orderObj);

    // Update user's shark points and order count
    if (user) {
      db.users.update(user._id, {
        sharkPts: (user.sharkPts || 0) + ptsEarned,
        orders: (user.orders || 0) + 1
      });
    }

    res.status(201).json({ success: true, order, ptsEarned });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
} );

// POST /api/orders/checkout — FACADE: stock check + payment strategy + builder + persistence in one call
router.post('/checkout', auth, async (req, res) => {
  try {
    const { items, address, paymentMethod, paymentDetails } = req.body;
    const result = CheckoutFacade.checkout({
      userId: req.user.id,
      items,
      address,
      paymentMethod,
      paymentDetails,
    });
    if (!result.success) return res.status(result.status).json({ error: result.error });
    res.status(201).json({ success: true, order: result.order, ptsEarned: result.ptsEarned, paymentMessage: result.paymentMessage });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

// GET /api/orders/:id/reorder — PROTOTYPE: clone a past order's items into a fresh draft
router.get('/:id/reorder', auth, (req, res) => {
  try {
    const source = db.orders.findOne({ _id: req.params.id });
    if (!source) return res.status(404).json({ error: 'Order not found' });
    if (source.userId !== req.user.id && !['admin', 'ceo', 'staff'].includes((req.user.role || '').toLowerCase())) {
      return res.status(403).json({ error: 'Not authorized to reorder this order' });
    }
    const prototype = new OrderPrototype(source);
    const draft = prototype.clone();
    res.json({ success: true, draft });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ error: 'Failed to build reorder draft' });
  }
});

// POST /api/orders/admin - Admin manual creation of order
router.post('/admin', staffOrAdminRequired, async (req, res) => {
  try {
    const { userId, items, total, address, status, paymentMethod } = req.body;
    
    const orderId = '#DS-' + String(Math.floor(Math.random() * 90000) + 10000);
    const trackingId = 'TRK-' + Date.now().toString(36).toUpperCase();
    
    const targetUser = db.users.findById(userId);

    const d1 = new Date(); d1.setDate(d1.getDate() + 3);
    const d2 = new Date(); d2.setDate(d2.getDate() + 5);
    const fmt = dt => dt.toLocaleDateString('en-EG', { month: 'short', day: 'numeric' });
    const estimatedDelivery = fmt(d1) + ' – ' + fmt(d2) + ', ' + d1.getFullYear();

    const orderObj = {
      orderId,
      userId: userId || 'fallback-id',
      customerName: targetUser ? targetUser.name : 'Admin Backordered',
      items: items || [],
      subtotal: total - 150,
      shipping: 150,
      total: total || 150,
      paymentMethod: paymentMethod || 'COD',
      trackingId,
      ptsEarned: 0,
      estimatedDelivery,
      address: address || '',
      status: status || 'Pending',
    };

    const order = db.orders.insert(orderObj);
    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create administrative order' });
  }
});

// GET /api/orders — Get user's orders (all for staff/admin, self-only for regular users)
router.get('/', auth, (req, res) => {
  try {
    const role = (req.user.role || '').toLowerCase();
    let orders;
    if (['admin', 'ceo', 'staff'].includes(role)) {
      orders = db.orders.find({}).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      orders = db.orders.find({ userId: req.user.id }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// PUT /api/orders/:id — Update order details (Admin/Staff only)
router.put('/:id', staffOrAdminRequired, async (req, res) => {
  try {
    const { status, address, trackingId, estimatedDelivery } = req.body;
    const updated = db.orders.update(req.params.id, { status, address, trackingId, estimatedDelivery });
    if (!updated) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, order: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

// DELETE /api/orders/:id — Delete order (Admin/Staff only)
router.delete('/:id', staffOrAdminRequired, async (req, res) => {
  try {
    const deleted = db.orders.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Order not found' });
    res.json({ success: true, message: 'Order cancelled/deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// GET /api/orders/track/:trackingId — Track order by tracking ID (public)
router.get('/track/:trackingId', (req, res) => {
  try {
    const order = db.orders.findOne({ trackingId: req.params.trackingId });
    if (!order) {
      // Also try by orderId
      const orderById = db.orders.findOne({ orderId: req.params.trackingId });
      if (!orderById) return res.status(404).json({ error: 'Order not found. Please check your tracking ID.' });
      return res.json({
        orderId: orderById.orderId,
        trackingId: orderById.trackingId,
        status: orderById.status,
        estimatedDelivery: orderById.estimatedDelivery,
        items: orderById.items.length,
        total: orderById.total,
        paymentMethod: orderById.paymentMethod,
        createdAt: orderById.createdAt,
      });
    }
    res.json({
      orderId: order.orderId,
      trackingId: order.trackingId,
      status: order.status,
      estimatedDelivery: order.estimatedDelivery,
      items: order.items.length,
      total: order.total,
      paymentMethod: order.paymentMethod,
      createdAt: order.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to track order' });
  }
});

module.exports = router;
