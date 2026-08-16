const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  name: String,
  brand: String,
  price: Number,
  qty: { type: Number, default: 1 },
  img: String,
  pts: Number,
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 150 },
  total: { type: Number, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'] },
  ptsEarned: { type: Number, default: 0 },
  paymentMethod: { type: String, default: 'COD', enum: ['COD', 'Card', 'Wallet', 'InstaPay'] },
  trackingId: { type: String },
  estimatedDelivery: { type: String },
  address: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
