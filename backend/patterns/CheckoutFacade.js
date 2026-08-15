/**
 * FACADE PATTERN
 * -------------------------------------------------------------------------
 * Checking out touches several subsystems: stock validation against the
 * product catalog, running the chosen PaymentStrategy, assembling the
 * order via OrderBuilder, persisting it through the Database singleton,
 * and updating the buyer's loyalty points/order count. CheckoutFacade is
 * the single method the route handler calls (`checkout(...)`) so the
 * route itself stays a thin HTTP adapter and doesn't need to know how any
 * of those subsystems work internally.
 */
const Database = require('./Database');
const OrderBuilder = require('./OrderBuilder');
const { PaymentStrategyFactory } = require('./PaymentStrategy');

class CheckoutFacade {
  /**
   * @param {{userId:string, items:Array, address:string, paymentMethod:string, paymentDetails:object}} req
 */
  static checkout({ userId, items, address, paymentMethod, paymentDetails }) {
    const db = Database.getInstance();

    if (!items || !items.length) {
      return { success: false, status: 400, error: 'Cart is empty' };
    }
    if (!address || !address.trim()) {
      return { success: false, status: 400, error: 'Shipping address is required' };
    }

    // 1) Stock / catalog validation subsystem
    const catalog = db.products.find({});
    for (const item of items) {
      const match = catalog.find(p => p.id === item.id || p.id === item.productId);
      if (!match) {
        return { success: false, status: 400, error: `Product "${item.name || item.id}" is no longer available` };
      }
    }

    // 2) Payment subsystem — Strategy pattern chooses the concrete processor
    const subtotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);
    const shipping = items.length ? 150 : 0;
    const total = subtotal + shipping;

    const strategy = PaymentStrategyFactory.get(paymentMethod);
    const paymentResult = strategy.pay(total, paymentDetails || {});
    if (!paymentResult.success) {
      return { success: false, status: 402, error: 'Payment declined' };
    }

    // 3) Order assembly subsystem — Builder pattern
    const user = db.users.findById(userId);
    const order = new OrderBuilder()
      .setUser(userId, user ? user.name : undefined)
      .setItems(items)
      .setAddress(address.trim())
      .setShipping(shipping)
      .setPayment(paymentResult.method, paymentResult)
      .build();

    // 4) Persistence subsystem
    const savedOrder = db.orders.insert(order);

    // 5) Loyalty-points subsystem
    if (user) {
      db.users.update(user._id, {
        sharkPts: (user.sharkPts || 0) + order.ptsEarned,
        orders: (user.orders || 0) + 1,
      });
    }

    return { success: true, status: 201, order: savedOrder, ptsEarned: order.ptsEarned, paymentMessage: paymentResult.message };
  }
}

module.exports = CheckoutFacade;
