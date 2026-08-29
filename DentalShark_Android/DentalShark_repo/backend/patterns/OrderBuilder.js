/**
 * BUILDER PATTERN
 * -------------------------------------------------------------------------
 * An Order has several independent pieces that must be assembled step by
 * step and then combined into computed fields (subtotal, shipping, total,
 * loyalty points, tracking id, estimated delivery window). OrderBuilder
 * exposes one chainable method per step (`setItems`, `setAddress`,
 * `setPayment`, `setShipping`) and only produces the final immutable order
 * object when `.build()` is called. CheckoutFacade is the "director" that
 * calls the steps in the right order — the route handlers never construct
 * an order object literal directly.
 */

class OrderBuilder {
  constructor() {
    this._items = [];
    this._address = '';
    this._paymentMethod = 'COD';
    this._paymentResult = null;
    this._shipping = 150;
    this._userId = null;
    this._customerName = 'Dental Professional';
  }

  setUser(userId, customerName) {
    this._userId = userId;
    this._customerName = customerName || this._customerName;
    return this;
  }

  setItems(items) {
    this._items = Array.isArray(items) ? items : [];
    return this;
  }

  setAddress(address) {
    this._address = address || '';
    return this;
  }

  setShipping(amount) {
    this._shipping = typeof amount === 'number' ? amount : (this._items.length ? 150 : 0);
    return this;
  }

  setPayment(paymentMethod, paymentResult) {
    this._paymentMethod = paymentMethod;
    this._paymentResult = paymentResult;
    return this;
  }

  build() {
    const subtotal = this._items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
    const total = subtotal + this._shipping;
    const ptsEarned = this._items.reduce((sum, it) => sum + (it.pts || 0) * (it.qty || 1), 0);

    const orderId = '#DS-' + String(Math.floor(Math.random() * 90000) + 10000);
    const trackingId = 'TRK-' + Date.now().toString(36).toUpperCase();

    const d1 = new Date(); d1.setDate(d1.getDate() + 3);
    const d2 = new Date(); d2.setDate(d2.getDate() + 5);
    const fmt = dt => dt.toLocaleDateString('en-EG', { month: 'short', day: 'numeric' });
    const estimatedDelivery = `${fmt(d1)} – ${fmt(d2)}, ${d1.getFullYear()}`;

    return {
      orderId,
      userId: this._userId,
      customerName: this._customerName,
      items: this._items,
      subtotal,
      shipping: this._shipping,
      total,
      paymentMethod: this._paymentMethod,
      paymentTransactionId: this._paymentResult?.transactionId || null,
      paymentMessage: this._paymentResult?.message || null,
      trackingId,
      ptsEarned,
      estimatedDelivery,
      address: this._address,
      status: 'Pending',
    };
  }
}

module.exports = OrderBuilder;
