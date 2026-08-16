const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String }, // Guest has no password
  role: { type: String, required: true, enum: ['CEO', 'Engineer', 'Vendor', 'Doctor', 'Staff', 'Student', 'Guest'] },
  dept: { type: String },
  phone: { type: String },
  initials: { type: String },
  color: { type: String },
  orders: { type: Number, default: 0 },
  spent: { type: String, default: '—' },
  joined: { type: String },
  sharkPts: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Return user data without password
userSchema.methods.toProfile = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
