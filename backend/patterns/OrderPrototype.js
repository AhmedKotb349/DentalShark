/**
 * PROTOTYPE PATTERN
 * -------------------------------------------------------------------------
 * "Reorder" needs a deep, independent copy of a past order's line items so
 * the customer can edit quantities / re-checkout without mutating the
 * original historical order record. OrderPrototype wraps an existing order
 * and exposes `clone()`, which deep-copies the item list (and re-validates
 * current price/points/stock against the live product catalog via the
 * Database singleton) instead of the route re-deriving a "new draft order"
 * from scratch by hand every time.
 */
const Database = require('./Database');

class OrderPrototype {
  constructor(sourceOrder) {
    this.sourceOrder = sourceOrder;
  }

  /** Deep-clones the source order's items, refreshing price/pts/img from the live catalog. */
  clone() {
    const db = Database.getInstance();
    const liveProducts = db.products.find({});

    const clonedItems = (this.sourceOrder.items || []).map(item => {
      const live = liveProducts.find(p => p.id === item.productId || p.id === item.id || p.pid === item.productId);
      return {
        id: live ? live.id : item.id || item.productId,
        productId: live ? live.id : item.productId || item.id,
        name: live ? live.name : item.name,
        brand: live ? live.brand : item.brand,
        price: live ? live.price : item.price,
        img: live ? live.img : item.img,
        pts: live ? live.pts : item.pts || 0,
        qty: item.qty || 1,
        outOfCatalog: !live, // flag so the UI can warn if the product no longer exists
      };
    });

    return {
      items: clonedItems,
      reorderedFrom: this.sourceOrder.orderId,
      subtotal: clonedItems.reduce((s, it) => s + it.price * it.qty, 0),
    };
  }
}

module.exports = OrderPrototype;
