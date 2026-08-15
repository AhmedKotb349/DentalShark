/**
 * STRATEGY PATTERN
 * -------------------------------------------------------------------------
 * Checkout must support at least two interchangeable payment methods
 * (Credit Card / PayPal), each with its own validation and "processing"
 * logic. Rather than branching on `paymentMethod === 'Card'` inside the
 * checkout route, each method is its own strategy class implementing the
 * same `pay(amount, details)` contract. CheckoutFacade picks the concrete
 * strategy at runtime via `PaymentStrategyFactory.get(method)` and calls it
 * polymorphically — it never needs to know which concrete class it holds.
 */

class PaymentStrategy {
  /** @returns {{success:boolean, transactionId:string, method:string, message:string}} */
  pay(amount /* number */, details /* object */) {
    throw new Error('pay() must be implemented by a concrete PaymentStrategy');
  }
}

class CreditCardPayment extends PaymentStrategy {
  pay(amount, details = {}) {
    const { cardNumber = '', cardHolder = '' } = details;
    const last4 = cardNumber ? cardNumber.replace(/\s/g, '').slice(-4) : '0000';
    return {
      success: true,
      transactionId: 'CC-' + Date.now().toString(36).toUpperCase(),
      method: 'Credit Card',
      message: `Charged EGP ${amount.toLocaleString()} to card ending in ${last4}${cardHolder ? ' (' + cardHolder + ')' : ''}`,
    };
  }
}

class PayPalPayment extends PaymentStrategy {
  pay(amount, details = {}) {
    const { paypalEmail = 'buyer@paypal.com' } = details;
    return {
      success: true,
      transactionId: 'PP-' + Date.now().toString(36).toUpperCase(),
      method: 'PayPal',
      message: `Paid EGP ${amount.toLocaleString()} via PayPal account ${paypalEmail}`,
    };
  }
}

class CashOnDeliveryPayment extends PaymentStrategy {
  pay(amount) {
    return {
      success: true,
      transactionId: 'COD-' + Date.now().toString(36).toUpperCase(),
      method: 'Cash on Delivery',
      message: `EGP ${amount.toLocaleString()} to be collected on delivery`,
    };
  }
}

class WalletPayment extends PaymentStrategy {
  pay(amount, details = {}) {
    const { walletNumber = '' } = details;
    return {
      success: true,
      transactionId: 'WAL-' + Date.now().toString(36).toUpperCase(),
      method: 'E-Wallet (Vodafone Cash)',
      message: `Paid EGP ${amount.toLocaleString()} via Vodafone Cash${walletNumber ? ' (' + walletNumber + ')' : ''}`,
    };
  }
}

class BankTransferPayment extends PaymentStrategy {
  pay(amount) {
    return {
      success: true,
      transactionId: 'BNK-' + Date.now().toString(36).toUpperCase(),
      method: 'InstaPay Bank Transfer',
      message: `EGP ${amount.toLocaleString()} transfer initiated via InstaPay`,
    };
  }
}

const PaymentStrategyFactory = {
  get(method) {
    switch ((method || '').toLowerCase()) {
      case 'card':
      case 'credit card':
      case 'creditcard':
      case 'credit / debit card':  return new CreditCardPayment();
      case 'paypal':                return new PayPalPayment();
      case 'wallet':
      case 'e-wallet':
      case 'vodafone cash':
      case 'e-wallet (vodafone cash)': return new WalletPayment();
      case 'bank':
      case 'bank transfer':
      case 'instapay':
      case 'instapay bank transfer':   return new BankTransferPayment();
      default:                      return new CashOnDeliveryPayment();
    }
  },
};

module.exports = { PaymentStrategy, CreditCardPayment, PayPalPayment, CashOnDeliveryPayment, WalletPayment, BankTransferPayment, PaymentStrategyFactory };
