/**
 * DECORATOR PATTERN
 * -------------------------------------------------------------------------
 * A cart line's price/description need to change live when the customer
 * toggles optional add-ons (Gift Wrap, Extended Warranty, Express
 * Shipping), and any combination of add-ons must be stackable. Instead of
 * a `basePrice + (giftWrap?10:0) + (warranty?...:0)` expression scattered
 * across the UI, each add-on is a Decorator that wraps a `CartLineItem`
 * (or another decorator) and implements the same `getPrice()` /
 * `getDescription()` interface — so decorators can be composed in any
 * order and the component that renders the cart never needs to know how
 * many add-ons are stacked on a line.
 */

class CartLineItem {
  constructor(cartItem) {
    this.cartItem = cartItem; // { id, name, price, qty, ... }
  }
  getPrice() { return this.cartItem.price * this.cartItem.qty; }
  getUnitPrice() { return this.cartItem.price; }
  getDescription() { return this.cartItem.name; }
}

class CartItemDecorator extends CartLineItem {
  constructor(wrapped) {
    super(wrapped.cartItem);
    this.wrapped = wrapped;
  }
  getPrice() { return this.wrapped.getPrice(); }
  getUnitPrice() { return this.wrapped.getUnitPrice(); }
  getDescription() { return this.wrapped.getDescription(); }
}

class GiftWrapDecorator extends CartItemDecorator {
  static FEE = 40;
  static KEY = 'giftWrap';
  static LABEL = 'Gift Wrap (+EGP 40)';
  getPrice() { return this.wrapped.getPrice() + GiftWrapDecorator.FEE; }
  getDescription() { return `${this.wrapped.getDescription()} + Gift Wrap`; }
}

class ExtendedWarrantyDecorator extends CartItemDecorator {
  static FEE = 150;
  static KEY = 'extendedWarranty';
  static LABEL = 'Extended Warranty (+EGP 150)';
  getPrice() { return this.wrapped.getPrice() + ExtendedWarrantyDecorator.FEE; }
  getDescription() { return `${this.wrapped.getDescription()} + 2yr Extended Warranty`; }
}

class ExpressShippingDecorator extends CartItemDecorator {
  static FEE = 90;
  static KEY = 'expressShipping';
  static LABEL = 'Express Shipping (+EGP 90)';
  getPrice() { return this.wrapped.getPrice() + ExpressShippingDecorator.FEE; }
  getDescription() { return `${this.wrapped.getDescription()} + Express Shipping (24h)`; }
}

const ADDON_REGISTRY = {
  [GiftWrapDecorator.KEY]: GiftWrapDecorator,
  [ExtendedWarrantyDecorator.KEY]: ExtendedWarrantyDecorator,
  [ExpressShippingDecorator.KEY]: ExpressShippingDecorator,
};

/**
 * Builds the fully-decorated line item for a cart entry.
 * @param {object} cartItem - { id, name, price, qty, addons?: string[] }
 */
function decorateCartItem(cartItem) {
  let decorated = new CartLineItem(cartItem);
  (cartItem.addons || []).forEach(key => {
    const Decorator = ADDON_REGISTRY[key];
    if (Decorator) decorated = new Decorator(decorated);
  });
  return decorated;
}

export {
  CartLineItem,
  CartItemDecorator,
  GiftWrapDecorator,
  ExtendedWarrantyDecorator,
  ExpressShippingDecorator,
  ADDON_REGISTRY,
  decorateCartItem,
};
