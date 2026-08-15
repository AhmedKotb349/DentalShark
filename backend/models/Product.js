const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  pid: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  brand: { type: String, required: true },
  cat: { type: String, required: true },
  cat2: { type: String, required: true },
  price: { type: Number, required: true },
  old: { type: Number },
  badge: { type: String, enum: ['sale', 'hot', 'new', 'flash', ''] },
  rating: { type: Number, default: 5.0 },
  rev: { type: Number, default: 0 },
  pts: { type: Number, default: 0 },
  img: { type: String },
  desc: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
